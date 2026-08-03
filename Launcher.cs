using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

class Program {
    static void Main() {
        try {
            string tempDir = Path.Combine(Path.GetTempPath(), "FocusTimerWidgetAppNative");
            Directory.CreateDirectory(tempDir);
            
            string exePath = Path.Combine(tempDir, "FocusTimer_Widget_core.exe");
            string neuPath = Path.Combine(tempDir, "resources.neu");
            string configPath = Path.Combine(tempDir, "neutralino.config.json");
            
            // Extract the core Neutralino binary
            ExtractResource("FocusTimer_Widget_core.exe", exePath);
            // Extract the web app resources
            ExtractResource("resources.neu", neuPath);
            // Extract the configuration file so Neutralino knows how to open the window
            ExtractResource("neutralino.config.json", configPath);
            
            ProcessStartInfo psi = new ProcessStartInfo(exePath);
            psi.WorkingDirectory = tempDir;
            psi.UseShellExecute = true;
            Process.Start(psi);
        } catch (Exception ex) {
            MessageBox.Show("오류 발생: " + ex.Message);
        }
    }

    static void ExtractResource(string resourceName, string outPath) {
        Assembly assembly = Assembly.GetExecutingAssembly();
        using (Stream stream = assembly.GetManifestResourceStream(resourceName)) {
            if (stream == null) return; // Resource not found
            using (FileStream fs = new FileStream(outPath, FileMode.Create, FileAccess.Write)) {
                stream.CopyTo(fs);
            }
        }
    }
}
