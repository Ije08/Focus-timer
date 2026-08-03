using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

class Program {
    static HttpListener listener;
    static int port = 48271;
    static string tempDir;

    [STAThread]
    static void Main() {
        try {
            tempDir = Path.Combine(Path.GetTempPath(), "FocusTimerWebAssets");
            Directory.CreateDirectory(tempDir);

            Assembly assembly = Assembly.GetExecutingAssembly();
            using (Stream stream = assembly.GetManifestResourceStream("app.zip")) {
                if (stream != null) {
                    using (ZipArchive archive = new ZipArchive(stream)) {
                        foreach (ZipArchiveEntry entry in archive.Entries) {
                            string fullPath = Path.Combine(tempDir, entry.FullName);
                            if (string.IsNullOrEmpty(entry.Name)) {
                                Directory.CreateDirectory(fullPath);
                            } else {
                                Directory.CreateDirectory(Path.GetDirectoryName(fullPath));
                                entry.ExtractToFile(fullPath, true);
                            }
                        }
                    }
                }
            }

            listener = new HttpListener();
            listener.Prefixes.Add(string.Format("http://localhost:{0}/", port));
            listener.Start();

            Thread serverThread = new Thread(StartServer);
            serverThread.IsBackground = true;
            serverThread.Start();

            string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edgePath)) {
                edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }
            if (!File.Exists(edgePath)) {
                edgePath = "msedge.exe";
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = edgePath;
            psi.Arguments = string.Format("--app=http://localhost:{0}/?widget=true --window-size=290,340", port);
            Process edgeProcess = Process.Start(psi);

            if (edgeProcess != null) {
                edgeProcess.WaitForExit();
            }
        } catch (Exception ex) {
            MessageBox.Show("FocusTimer 실행 오류: " + ex.Message);
        } finally {
            if (listener != null && listener.IsListening) {
                listener.Stop();
            }
        }
    }

    static void StartServer() {
        while (listener.IsListening) {
            try {
                HttpListenerContext context = listener.GetContext();
                HttpListenerRequest request = context.Request;
                HttpListenerResponse response = context.Response;

                string rawUrl = request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl)) rawUrl = "index.html";

                string filePath = Path.Combine(tempDir, rawUrl);
                if (File.Exists(filePath)) {
                    byte[] buffer = File.ReadAllBytes(filePath);
                    response.ContentType = GetContentType(filePath);
                    response.ContentLength64 = buffer.Length;
                    response.OutputStream.Write(buffer, 0, buffer.Length);
                } else {
                    response.StatusCode = 404;
                }
                response.OutputStream.Close();
            } catch {}
        }
    }

    static string GetContentType(string path) {
        string ext = Path.GetExtension(path).ToLower();
        switch (ext) {
            case ".html": return "text/html; charset=utf-8";
            case ".js": return "application/javascript; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".svg": return "image/svg+xml";
            case ".png": return "image/png";
            case ".json": return "application/json";
            default: return "application/octet-stream";
        }
    }
}
