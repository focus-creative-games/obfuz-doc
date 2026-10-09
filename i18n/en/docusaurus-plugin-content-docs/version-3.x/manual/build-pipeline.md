# Obfuscation During Build Process

Obfuz automatically performs obfuscation during Unity's build process.

## Principle

`Obfuz.Unity.ObfuscationProcess` implements the `IPostBuildPlayerScriptDLLs` interface and performs obfuscation in the callback event.

## Settings

All obfuscation settings are contained in `ObfuzSettings`. See [Configuration](./configuration) for details.

## Enable/Disable Obfuscation During Build

The `ObfuzSettings.Enable` option indicates whether to perform obfuscation in the build pipeline. If this option is disabled, obfuscation will not be performed during the build process.

This option only affects the build process and does not impact manual obfuscation via the `Obfuscator`.

## Obfuscation Events

Obfuz provides two obfuscation events:

- `Obfuz.Unity.ObfuscationBeginEventArgs`
- `Obfuz.Unity.ObfuscationEndEventArgs`

Listen for the obfuscation start event with `ObfuscationProcess.OnObfuscationBegin += YourCallback`,
and the obfuscation end event with `ObfuscationProcess.OnObfuscationEnd += YourCallback`.

In practice, it's recommended to use the `[InitializeOnLoadMethod]` attribute to listen for obfuscation events immediately after assemblies are loaded. Example code:

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

## Accessing Original and Obfuscated Assemblies

The obfuscation process modifies all assemblies in the `AssemblySettings.AssembliesToObfuscate` and `AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies` lists.

- Before obfuscation, original assemblies are copied to `Library/Obfuz/{buildTarget}/OriginalAssemblies`.
- After obfuscation, modified assemblies are copied to `Library/Obfuz/{buildTarget}/ObfuscatedAssemblies`.

## link.xml Issues

If you obfuscate AOT assemblies and preserve types from these obfuscated AOT assemblies in `link.xml`, the preserved names will be the original (pre-obfuscation) names, making these configurations ineffective.

Obfuz solves this problem by scanning all `link.xml` files during the `IUnityLinkerProcessor.GenerateAdditionalLinkXmlFile` event, replacing pre-obfuscation names with post-obfuscation names, and generating a new `link.xml` file. See the `Obfuz.Unity.LinkXmlProcess` class for implementation details.
