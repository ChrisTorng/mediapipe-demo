var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
function parseArgs() {
    var output = path.resolve(process.cwd(), "docs/demos/perf/session-metrics.json");
    var metricsArgIndex = process.argv.findIndex(function (arg) { return arg === "--metrics"; });
    if (metricsArgIndex !== -1) {
        var payload = process.argv[metricsArgIndex + 1];
        if (payload) {
            try {
                var metrics = JSON.parse(payload);
                return { output: output, metrics: metrics };
            }
            catch (error) {
                throw new Error("\u7121\u6CD5\u89E3\u6790 metrics \u53C3\u6578\uFF1A".concat(error));
            }
        }
    }
    if (process.env.XR_METRICS) {
        try {
            return {
                output: output,
                metrics: JSON.parse(process.env.XR_METRICS),
            };
        }
        catch (error) {
            throw new Error("XR_METRICS \u74B0\u5883\u8B8A\u6578\u683C\u5F0F\u932F\u8AA4\uFF1A".concat(error));
        }
    }
    return {
        output: output,
        metrics: undefined,
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, output, metrics, resolvedMetrics, payload;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = parseArgs(), output = _a.output, metrics = _a.metrics;
                    resolvedMetrics = metrics !== null && metrics !== void 0 ? metrics : {
                        rollingFps: 45,
                        latencyMs: 180,
                        sampleCount: 0,
                    };
                    payload = __assign(__assign({}, resolvedMetrics), { generatedAt: new Date().toISOString() });
                    return [4 /*yield*/, mkdir(path.dirname(output), { recursive: true })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, writeFile(output, JSON.stringify(payload, null, 2), "utf-8")];
                case 2:
                    _b.sent();
                    process.stdout.write("\u5DF2\u8F38\u51FA\u6027\u80FD\u6307\u6A19\u81F3 ".concat(output, "\n"));
                    return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("匯出性能指標失敗", error);
    process.exitCode = 1;
});
