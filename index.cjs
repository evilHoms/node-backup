"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var googleapis_1 = require("googleapis");
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var MODE;
(function (MODE) {
    MODE[MODE["UPLOAD"] = 0] = "UPLOAD";
    MODE[MODE["DOWNLOAD"] = 1] = "DOWNLOAD";
    MODE[MODE["INFO"] = 2] = "INFO";
})(MODE || (MODE = {}));
var G_BACKUP_FOLDER_NAME = "backups";
var auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: (0, node_path_1.resolve)("./creds.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
});
var drive = googleapis_1.google.drive({ version: "v3", auth: auth });
/**
 * Load list of all files
 * @returns list of files
 */
var getAllFiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var data, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, drive.files.list({
                        fields: "*",
                    })];
            case 1:
                data = (_a.sent()).data;
                return [2 /*return*/, data.files || null];
            case 2:
                err_1 = _a.sent();
                throw err_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Upload file to gdrive
 * @param file params to upload
 */
var addFile = function (_a) {
    var name = _a.name, filePath = _a.filePath, folderId = _a.folderId;
    return __awaiter(void 0, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, drive.files.create({
                            requestBody: {
                                name: name,
                                parents: folderId ? [folderId] : [],
                            },
                            media: {
                                body: (0, node_fs_1.createReadStream)(filePath),
                            },
                        })];
                case 1:
                    _b.sent();
                    console.log("File successfully uploaded.");
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _b.sent();
                    throw err_2;
                case 3: return [2 /*return*/];
            }
        });
    });
};
/**
 * Creates folder if it doesn't exist
 * @param folderName
 * @returns true if file was created, otherwise false
 */
var createFolder = function (folderName) { return __awaiter(void 0, void 0, void 0, function () {
    var data, d, err_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, drive.files.list({
                        q: "mimeType='application/vnd.google-apps.folder' and name='".concat(folderName, "'"),
                        fields: "files(id, name)",
                    })];
            case 1:
                data = (_b.sent()).data;
                if ((_a = data.files) === null || _a === void 0 ? void 0 : _a.length) {
                    console.log("Backup dir already exists.");
                    return [2 /*return*/, data.files[0].id || null];
                }
                return [4 /*yield*/, drive.files.create({
                        requestBody: {
                            name: folderName,
                            mimeType: "application/vnd.google-apps.folder",
                        },
                        fields: "id, name",
                    })];
            case 2:
                d = (_b.sent()).data;
                console.log("Backup dir created.");
                return [2 /*return*/, d.id || null];
            case 3:
                err_3 = _b.sent();
                throw err_3;
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Remove file by id
 * @param fileId
 */
var removeFile = function (fileId) { return __awaiter(void 0, void 0, void 0, function () {
    var err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, drive.files.delete({
                        fileId: fileId,
                    })];
            case 1:
                _a.sent();
                console.log("File: ".concat(fileId, " removed."));
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                throw err_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * Launch file uploading
 */
var uploadFile = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var folderId, name, files, backupDirId, backups;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, createFolder(G_BACKUP_FOLDER_NAME)];
            case 1:
                folderId = _b.sent();
                if (folderId === null) {
                    throw new Error("Unable to create folder.");
                }
                name = filePath.split("/").slice(-1)[0];
                return [4 /*yield*/, addFile({ name: name, filePath: filePath, folderId: folderId })];
            case 2:
                _b.sent();
                return [4 /*yield*/, getAllFiles()];
            case 3:
                files = _b.sent();
                backupDirId = ((_a = files === null || files === void 0 ? void 0 : files.find(function (f) { return f.name === G_BACKUP_FOLDER_NAME; })) === null || _a === void 0 ? void 0 : _a.id) || null;
                if (backupDirId === null) {
                    throw new Error("Unable to locate backup folder.");
                }
                backups = (files === null || files === void 0 ? void 0 : files.filter(function (f) { var _a; return (_a = f.parents) === null || _a === void 0 ? void 0 : _a.includes(backupDirId); })) || null;
                if (backups === null) {
                    throw new Error("Backup creation fail.");
                }
                if (backups.length > 10) {
                    backups.sort(function (a, b) {
                        return (new Date(a.modifiedTime).getTime() -
                            new Date(b.modifiedTime).getTime());
                    });
                    removeFile(backups[0].id);
                }
                return [2 /*return*/];
        }
    });
}); };
/**
 * Shows uploaded backups list
 */
var getInfo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var files, formated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getAllFiles()];
            case 1:
                files = _a.sent();
                formated = files === null || files === void 0 ? void 0 : files.filter(function (f) { return !/folder/.test(f.mimeType || ""); }).map(function (f) { return "".concat(f.id, ":").concat(f.name); }).join(" ");
                console.log(formated);
                return [2 /*return*/];
        }
    });
}); };
/**
 * Download specified backup
 * @param backupId id from getInfo
 */
var downloadBackup = function (backupId, name) { return __awaiter(void 0, void 0, void 0, function () {
    var dirPath, outFile, out;
    return __generator(this, function (_a) {
        dirPath = "./downloaded-backups";
        if (!(0, node_fs_1.existsSync)(dirPath)) {
            (0, node_fs_1.mkdirSync)(dirPath);
        }
        outFile = (0, node_path_1.resolve)("".concat(dirPath, "/").concat(name || backupId));
        out = (0, node_fs_1.createWriteStream)(outFile);
        drive.files.get({ fileId: backupId, alt: "media" }, { responseType: "stream" }, function (err, res) {
            res === null || res === void 0 ? void 0 : res.data.on("end", function () {
                console.log("Downloaded");
            }).on("error", function (err) {
                throw err;
            }).pipe(out);
        });
        return [2 /*return*/];
    });
}); };
var postArg = process.argv.find(function (arg) { return /post=/.test(arg); });
var getArg = process.argv.find(function (arg) { return /get=/.test(arg); });
var mode = MODE.INFO;
if (postArg) {
    mode = MODE.UPLOAD;
}
else if (getArg) {
    mode = MODE.DOWNLOAD;
}
var filePath = (postArg === null || postArg === void 0 ? void 0 : postArg.split("=")[1]) || null;
var backupId = (getArg === null || getArg === void 0 ? void 0 : getArg.split("=")[1].split(":")[0]) || null;
var backupName = (getArg === null || getArg === void 0 ? void 0 : getArg.split("=")[1].split(":")[1]) || backupId;
try {
    switch (mode) {
        case MODE.UPLOAD: {
            uploadFile(filePath);
            break;
        }
        case MODE.DOWNLOAD: {
            downloadBackup(backupId, backupName);
            break;
        }
        case MODE.INFO: {
            getInfo();
            break;
        }
    }
}
catch (err) {
    throw err;
}
