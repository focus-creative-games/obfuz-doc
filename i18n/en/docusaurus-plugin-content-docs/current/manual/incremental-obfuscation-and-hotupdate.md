# Incremental Obfuscation and Hot Update

Obfuz supports incremental obfuscation, with most Obfuscation Passes striving to maintain obfuscation stability.

- Symbol Obfuscation uses symbol mapping files to ensure obfuscation stability.
- Const Obfuscation uses deterministic random encryption algorithms for each constant.
- Field Encryption uses deterministic random encryption algorithms for each field.
- Call Obfuscation uses deterministic random encryption algorithms for each called function.

## Obfuscation in Build Pipeline

Simply keeping settings stable will automatically maintain obfuscation stability in the build pipeline.

## Standalone Obfuscation Execution

As long as obfuscation settings are not modified, it works the same as obfuscation in the build pipeline and will automatically maintain obfuscation stability. For detailed documentation, see [Run Obfuscation Standalone](./run-obfuscation-standalonely).

## Hot Update

Obfuscation in hot updates follows exactly the same process as standalone obfuscation execution.

If incremental obfuscation stability is not a concern, you can modify the following parameters to make the obfuscation results as different as possible for each hot update:

- Delete hot update code related configuration sections from the symbol mapping file
- Modify the `SecretSettings.DefaultDynamicSecretKey` field
- Modify the `SecretSettings.RandomSeed` field

Modifying `ConstEncrypSettings.EncryptionLevel`, `FieldEncryptSettings.EncryptionLevel`, and `CallObfusSettings.ObfuscationLevel` can also affect obfuscation results.
However, increasing these values will cause encryption performance degradation, so it's recommended not to modify them frequently.

## HybridCLR Issues

HybridCLR's `HybridCLR/Generate/All` and `HybridCLR/Generate/LinkXml` both generate link.xml based on unobfuscated code, which causes the link.xml generated after obfuscation to have completely ineffective reservations for obfuscated assemblies, since the corresponding names don't exist in the obfuscated assemblies.

The solution is to generate an additional link.xml for the obfuscated assemblies, with the following code:

```csharp


public static class GenerateLinkXmlForObfuscatedAssembly
{
    [MenuItem("Obfuz/GenerateLinkXmlForHybridCLR")]
    public static void GenerateLinkXml()
    {
        CompileDllCommand.CompileDllActiveBuildTarget();
        BuildTarget target = EditorUserBuildSettings.activeBuildTarget;
        var obfuzSettings = ObfuzSettings.Instance;

        var assemblySearchDirs = new List<string>
        {
            SettingsUtil.GetHotUpdateDllsOutputDirByTarget(target),
        };
        ObfuscatorBuilder builder = ObfuscatorBuilder.FromObfuzSettings(obfuzSettings, target, true);
        builder.InsertTopPriorityAssemblySearchPaths(assemblySearchDirs);

        Obfuscator obfuz = builder.Build();
        obfuz.Run();


        List<string> hotfixAssemblies = SettingsUtil.HotUpdateAssemblyNamesExcludePreserved;

        var analyzer = new Analyzer(new PathAssemblyResolver(builder.ObfuscatedAssemblyOutputPath));
        var refTypes = analyzer.CollectRefs(hotfixAssemblies);

        // LinkXmlWriter in HybridCLR is not public and cannot be accessed in other assemblies, can only be operated through reflection
        var linkXmlWriter = typeof(SettingsUtil).Assembly.GetType("HybridCLR.Editor.Link.LinkXmlWriter");
        var writeMethod = linkXmlWriter.GetMethod("Write", BindingFlags.Public | BindingFlags.Instance);
        var instance = Activator.CreateInstance(linkXmlWriter);
        string linkXmlOutputPath = $"{Application.dataPath}/Obfuz/link.xml";
        writeMethod.Invoke(instance, new object[] { linkXmlOutputPath, refTypes });
        Debug.Log($"[GenerateLinkXmlForObfuscatedAssembly] output:{linkXmlOutputPath}");
        AssetDatabase.Refresh();
    }
}

```

:::warning
Before building the game, be sure to run `Obfuz/GenerateLinkXmlForHybridCLR` first, then run `HybridCLR/Generate/All`, otherwise trimming exceptions will occur.
:::
