# Assemblies

## Assembly Types

For Obfuz, there are four types of assemblies:

1. **Non-obfuscatable assemblies**: Fundamental assemblies like `mscorlib` and `netstandard` cannot be obfuscated.
2. **Non-obfuscated assemblies that don't reference obfuscated assemblies**: Assemblies like `System`, `System.Core`, and `UnityEngine.CoreModule` don't need to be obfuscated. They are only referenced by obfuscated assemblies but don't reference any obfuscated assemblies themselves.
3. **Obfuscated assemblies**: Typically, business code assemblies developed by users are configured as obfuscated assemblies.
4. **Non-obfuscated assemblies that reference obfuscated assemblies**: In some cases, developers may want certain business assemblies to remain unobfuscated while they reference other obfuscated assemblies.

## Why Distinguish Type 4 Assemblies

Most obfuscation and encryption are confined within individual assemblies, but some special obfuscation or encryption passes need to process assemblies that reference obfuscated metadata.

### Symbol Obfuscation

Symbols like types and functions in obfuscated assemblies may have their names modified. If an assembly references an obfuscated assembly, the references in the referencing assembly must be updated when symbols in the obfuscated assembly are renamed. Therefore, Obfuz must know which assemblies are Type 4 to ensure correct cross-assembly references after obfuscation.

### Field Encryption

After fields are memory-encrypted, all code accessing those fields must be replaced with encryption and decryption code. If other assemblies access these fields, their access code must also be replaced with encryption and decryption code.

## Settings

:::tip
Almost any assembly can be obfuscated, including `System`, `System.Core`, `UnityEngine.*`, and even `Obfuz.Runtime`!
:::

:::warning
If an assembly doesn't need to be obfuscated but references obfuscated assemblies, it must be added to the `NonObfuscatedButReferenceingObfuscatedAssemblies` list!
:::

The `Assembly Settings` field in `ObfuzSettings` contains configuration related to obfuscated assemblies. See [Configuration](./configuration) for details.

Obviously, you must configure which assemblies are Type 3. Theoretically, Type 4 assemblies (those referencing obfuscated assemblies) could be automatically detected. However, because these assemblies might exist as plugins or outside the Unity project, Obfuz might not be able to detect them. For simplicity, Obfuz requires manual configuration of Type 4 assemblies.

Add Type 3 assemblies to the `AssemblyToObfuscate` list, and Type 4 assemblies to the `NonObfuscatedButReferenceingObfuscatedAssemblies` list.

**Do not add Type 1 or Type 2 assemblies to either list** as it's unnecessary! Adding Type 1 assemblies to these lists may even cause errors!

## Assemblies in DLL Form or Located Outside the Unity Project

If these assemblies are Type 3 or Type 4, they must be added to the relevant obfuscation lists. Additionally, since Obfuz doesn't know how to locate these assemblies, you need to add their search paths in the `Additional Assembly Search Paths` under `Assembly Settings`.
