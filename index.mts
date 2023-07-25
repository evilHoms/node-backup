import { google } from "googleapis";
import {
    createReadStream,
    createWriteStream,
    existsSync,
    mkdirSync,
} from "node:fs";
import { resolve } from "node:path";

interface File {
    name: string;
    filePath: string;
    folderId?: string;
}

enum MODE {
    UPLOAD,
    DOWNLOAD,
    INFO,
}

const G_BACKUP_FOLDER_NAME = "backups";

const auth = new google.auth.GoogleAuth({
    keyFile: resolve("./creds.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

/**
 * Load list of all files
 * @returns list of files
 */
const getAllFiles = async () => {
    try {
        const { data } = await drive.files.list({
            fields: "*",
        });
        return data.files || null;
    } catch (err) {
        throw err;
    }
};

/**
 * Upload file to gdrive
 * @param file params to upload
 */
const addFile = async ({ name, filePath, folderId }: File) => {
    try {
        await drive.files.create({
            requestBody: {
                name,
                parents: folderId ? [folderId] : [],
            },
            media: {
                body: createReadStream(filePath),
            },
        });
        console.log("File successfully uploaded.");
    } catch (err) {
        throw err;
    }
};

/**
 * Creates folder if it doesn't exist
 * @param folderName
 * @returns true if file was created, otherwise false
 */
const createFolder = async (folderName: string) => {
    try {
        const { data } = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
            fields: "files(id, name)",
        });

        if (data.files?.length) {
            console.log("Backup dir already exists.");
            return data.files[0].id || null;
        }

        const { data: d } = await drive.files.create({
            requestBody: {
                name: folderName,
                mimeType: "application/vnd.google-apps.folder",
            },
            fields: "id, name",
        });
        console.log("Backup dir created.");
        return d.id || null;
    } catch (err) {
        throw err;
    }
};

/**
 * Remove file by id
 * @param fileId
 */
const removeFile = async (fileId: string) => {
    try {
        await drive.files.delete({
            fileId,
        });
        console.log(`File: ${fileId} removed.`);
    } catch (err) {
        throw err;
    }
};

/**
 * Launch file uploading
 */
const uploadFile = async (filePath: string) => {
    const folderId = await createFolder(G_BACKUP_FOLDER_NAME);

    if (folderId === null) {
        throw new Error("Unable to create folder.");
    }

    const name = filePath.split("/").slice(-1)[0];
    await addFile({ name, filePath, folderId });
    const files = await getAllFiles();

    const backupDirId =
        files?.find((f) => f.name === G_BACKUP_FOLDER_NAME)?.id || null;

    if (backupDirId === null) {
        throw new Error("Unable to locate backup folder.");
    }

    const backups =
        files?.filter((f) => f.parents?.includes(backupDirId)) || null;

    if (backups === null) {
        throw new Error("Backup creation fail.");
    }

    if (backups.length > 10) {
        backups.sort((a, b) => {
            return (
                new Date(a.modifiedTime!).getTime() -
                new Date(b.modifiedTime!).getTime()
            );
        });
        removeFile(backups[0].id!);
    }
};

/**
 * Shows uploaded backups list
 */
const getInfo = async () => {
    const files = await getAllFiles();
    const formated = files
        ?.filter((f) => !/folder/.test(f.mimeType || ""))
        .map((f) => `${f.id}:${f.name}`)
        .join(" ");
    console.log(formated);
};

/**
 * Download specified backup
 * @param backupId id from getInfo
 */
const downloadBackup = async (backupId: string, name?: string) => {
    const dirPath = "./downloaded-backups";
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath);
    }
    const outFile = resolve(`${dirPath}/${name || backupId}`);
    const out = createWriteStream(outFile);
    drive.files.get(
        { fileId: backupId, alt: "media" },
        { responseType: "stream" },
        (err, res) => {
            res?.data
                .on("end", () => {
                    console.log("Downloaded");
                })
                .on("error", (err) => {
                    throw err;
                })
                .pipe(out);
        }
    );
};

const postArg = process.argv.find((arg) => /post=/.test(arg));
const getArg = process.argv.find((arg) => /get=/.test(arg));
let mode = MODE.INFO;

if (postArg) {
    mode = MODE.UPLOAD;
} else if (getArg) {
    mode = MODE.DOWNLOAD;
}

const filePath = postArg?.split("=")[1] || null;
const backupId = getArg?.split("=")[1].split(":")[0] || null;
const backupName = getArg?.split("=")[1].split(":")[1] || backupId;

try {
    switch (mode) {
        case MODE.UPLOAD: {
            uploadFile(filePath!);
            break;
        }
        case MODE.DOWNLOAD: {
            downloadBackup(backupId!, backupName!);
            break;
        }
        case MODE.INFO: {
            getInfo();
            break;
        }
    }
} catch (err) {
    throw err;
}
