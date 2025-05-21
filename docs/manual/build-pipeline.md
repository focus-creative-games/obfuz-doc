# 构建过程中执行混淆

Obfuz会自动在Unity的构建过程中执行混淆操作。

## 原理

`Obfuz.Unity.ObfuscationProcess`实现了IPostBuildPlayerScriptDLLs接口，在回调事件中执行了混淆操作。

## 设置

`ObfuzSettings`中包含所有混淆设置，详细见[设置](./configuration)。

## 启用与禁用构建过程中的混淆行为

`ObfuzSettings.Enable`选项指示是否在构建管线中进行混淆。如果取消此选项，则在构建过程中不会执行混淆操作。

此选项只影响构建过程，不影响开发者主动调用Obfuscator执行混淆操作。

## 混淆事件

Obfuz提供两个混淆事件：

- Obfuz.Unity.ObfuscationBeginEventArgs
- Obfuz.Unity.ObfuscationEndEventArgs

调用`ObfuscationProcess.OnObfuscatioinBegin += YourCallback`监听混淆开始事件，
调用`ObfuscationProcess.OnObfuscatioinEnd += YourCallback`监听混淆开始事件。

实践中建议使用`[InitializOnLoadMethod]`特性在加载完程序集后即监听混淆事件，示例代码如下：

```csharp

public class TestObfuscationEvent
{
    [InitializeOnLoadMethod]
    private static void Init()
    {
        ObfuscationProcess.OnObfuscationBegin += OnObfuscationBegin;
        ObfuscationProcess.OnObfuscationEnd += OnObfuscationEnd;
    }

    private static void OnObfuscationBegin(ObfuscationBeginEventArgs args)
    {
        Debug.Log($"OnObfuscationBegin");
    }

    private static void OnObfuscationEnd(ObfuscationEndEventArgs args)
    {
        Debug.Log($"OnObfuscationEnd");
    }
}

```

## 获得混淆前的程序集和混淆后的程序集

混淆流程会修改`AssemblySettings.AssembliesToObfuscate`和`AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies`列表中所有程序集。

- 在混淆前，这些原始程序集会被复制到`Libaray/Obfuz/{buildTarget}/OriginalAssemblies`目录。
- 混淆后的程序集会被复制到`Libaray/Obfuz/{buildTarget}/ObfuscatedAssemblies`目录。
