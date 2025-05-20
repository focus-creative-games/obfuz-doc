# 增量混淆与代码热更新

Obfuz支持增量混淆，大多数Obfusaction Pass会尽力保持混淆的稳定性。

- Symbol Obfuscation 使用symbol mapping文件保证混淆的稳定性。
- Const Obfuscation 对于每个常量使用确定性的随机加密算法。
- Field Encryption 对于每个字段使用确定性的随机加密算法。
- Call Obfusaction 对于每个被调用函数使用确定笥的随机加密算法。

## 构建流程中的混淆

只需要保持设置稳定，构建流程会自动保持混淆的稳定性。

## 单独执行混淆

只要混淆设置没有修改，跟构建流程中的混淆一样，会自动保持混淆的稳定性。具体文档见[单独执行混淆](./run-obfuscation-standalonely)。

## 代码热更新

代码热更新中的混淆与单独执行混淆的流程完全相同。

如果不考虑增量混淆的稳定性，可以修改以下参数让每次热更新的代码的混淆结果尽可能不一样：

- 删除symbol mapping文件中热更新代码相关的配置段
- 修改 `SecretSettings.DefaultDynmaicSecretKey`字段
- 修改 `SecretSettings.RandomSeed`字段

修改`ConstEncrypSettings.EncryptionLevel`、`FieldEncryptSetings.EncryptionLevel`、`CallObfusSettings.ObfuscationLevel`也可以影响混淆结果。
不过增大这些值会造成加密性能下降，所以建议不要频繁修改它。

## HybridCLR的一些问题

HybridCLR的`HybridCLR/Generate/All`及`HybridCLR/Generate/LinkXml`都是基于未混淆的代码生成的link.xml，这导致混淆后生成的link.xml关于混淆程序集相关的预留完全
没有生效，因为对应的名字在混淆后的程序集中并不存在。

解决办法为为混淆后的程序集额外生成一个link.xml，代码如下：

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

        // HyridCLR中 LinkXmlWritter不是public的，在其他程序集无法访问，只能通过反射操作
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
构建游戏前请一定要先运行`Obfuz/GenerateLinkXmlForHybridCLR`，再运行`HybridCLR/Generate/All`，否则会出现裁剪异常。
:::
