# Obfuz+HybridCLR

This project demonstrates how to use Obfuz with HybridCLR. For the complete sample project, see [WorkWithHybridCLR](https://github.com/focus-creative-games/obfuz-samples/tree/main/WorkWithHybridCLR).

For detailed documentation, see [Working with HybridCLR](../manual/hybridclr/work-with-hybridclr).

## Installation

Install the following plugins:

- com.code-philosophy.hybridclr `https://github.com/focus-creative-games/hybridclr_unity.git`
- com.code-philosophy.obfuz `https://github.com/focus-creative-games/obfuz.git`
- com.code-philosophy.obfuz4hybridclr `https://github.com/focus-creative-games/obfuz4hybridclr.git`

obufz4hybridclr is an Obfuz extension package for supporting HybridCLR hot update workflows.

:::warning

Both Obfuz and HybridCLR plugins include the dnlib plugin. For Unity, errors occur when two packages contain plugins with the same name.
The solution is to download HybridCLR locally, remove the included dnlib.dll, and then place it in the Packages directory.

:::

## Create Code

- Create a HotUpdate assembly and create a type Entry within it
- Create a `Bootstrap.cs` class in the Assets directory

For detailed code content, see the sample project.

## Configuration

- Add HotUpdate to the hot update assembly list in `HybridCLRSettings`
- Add HotUpdate and Assembly-CSharp to the `ObfuzSettings.AssembliesToObfuscate` list

## Add Build Code for Obfuscating Hot Update Code

```csharp
using HybridCLR.Editor;
using HybridCLR.Editor.Commands;
using Obfuz.Settings;
using Obfuz4HybridCLR;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

public static class BuildCommand
{
    [MenuItem("Build/CompileAndObfuscateAndCopyToStreamingAssets")]
    public static void CompileAndObfuscateAndCopyToStreamingAssets()
    {
        BuildTarget target = EditorUserBuildSettings.activeBuildTarget;
        CompileDllCommand.CompileDll(target);

        string obfuscatedHotUpdateDllPath = PrebuildCommandExt.GetObfuscatedHotUpdateAssemblyOutputPath(target);
        ObfuscateUtil.ObfuscateHotUpdateAssemblies(target, obfuscatedHotUpdateDllPath);

        Directory.CreateDirectory(Application.streamingAssetsPath);

        string hotUpdateDllPath = $"{SettingsUtil.GetHotUpdateDllsOutputDirByTarget(target)}";
        List<string> obfuscationRelativeAssemblyNames = ObfuzSettings.Instance.assemblySettings.GetObfuscationRelativeAssemblyNames();

        foreach (string assName in SettingsUtil.HotUpdateAssemblyNamesIncludePreserved)
        {
            string srcDir = obfuscationRelativeAssemblyNames.Contains(assName) ? obfuscatedHotUpdateDllPath : hotUpdateDllPath;
            string srcFile = $"{srcDir}/{assName}.dll";
            string dstFile = $"{Application.streamingAssetsPath}/{assName}.dll.bytes";
            if (File.Exists(srcFile))
            {
                File.Copy(srcFile, dstFile, true);
                Debug.Log($"[CompileAndObfuscate] Copy {srcFile} to {dstFile}");
            }
        }
    }
}

```

## Generate Encryption Virtual Machine and Keys

- Run the menu `Obfuz/GenerateEncryptionVM` to generate encryption virtual machine code. The default generated code file is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`.
- Run the menu `Obfuz/GenerateSecretKeyFile` to generate two key files. The default output files are `Assets/Resources/Obfuz/defaultStaticSecretKey.bytes` and `Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## Generate HybridCLR Related Code

HybridCLR's default `HybridCLR/Generate/All` command generates link.xml based on unobfuscated assemblies. If some AOT assemblies are obfuscated, the types and functions preserved in link.xml generated based on unobfuscated code are the names before obfuscation.
This causes link.xml to not truly preserve those obfuscated AOT types and functions. After building, running hot update code may result in types and functions being stripped.

The solution is to use the `HybridCLR/ObfuzExtension/GenerateAll` command specifically provided by Obfuz4HybridCLR.

Run `HybridCLR/ObfuzExtension/GenerateAll`.

## Generate Obfuscated Hot Update Assemblies and Copy to StreamingAssets Directory

Run `Build/CompileAndObfuscateAndCopyToStreamingAssets`.

## Build & Run

Run `Build And Run` in `Build Settings` to build and run. Check the player.log to verify that it is running correctly.

## View Obfuscated HotUpdate Assembly

Open the output directory from the previous `Build & Run` step, and use [ILSpy](https://github.com/icsharpcode/ILSpy) to open `ObfuzDemo_Data\StreamingAssets\HotUpdate.dll.bytes`
to view the obfuscated assembly.

The obfuscated code of the Entry class is as follows:

```csharp
using $A;
using UnityEngine;

public class Entry : MonoBehaviour
{
    private void Start()
    {
        $c.$a($A.$C<$A.$c>.$K($d.$A, 0, 11, 32, 862320345), $A.$C<$A.$c>.$d(1718597184, 154, 2114032877));
    }

    private void Update()
    {
    }
}


```
