# Polymorphic DLL Files

By default, `Assembly.Load` requires passing in standard dll files, meaning malicious crackers can obtain complete original dll files or load malicious third-party dlls, creating significant security risks for developers.
Even if dll files are encrypted, malicious crackers can still dump complete original dll files by hooking the `Assembly.Load` entry point.

Obfuz effectively counters such dll dumping or tampering behaviors by supporting polymorphic dll files.

## Features

- Brand new dll file structure that can no longer be opened by conventional dll decompilation tools like ILSpy.
- Brand new metadata structure that can no longer be easily restored to original CLI metadata data.
- **Supports randomization of dll file structure and metadata structure**, with dozens of metadata structures and hundreds of metadata fields completely randomized. Each developer's final dll structure is different, dramatically increasing the cracking cost for malicious crackers.
- Supports prohibiting loading of standard dll files, preventing loading of malicious dlls through `Assembly.Load` calls.

## Settings

`ObfuzSettings.PolymorphicDllSettings` contains polymorphic dll related settings, detailed documentation can be found in [Configuration](../configuration).

:::tip

HybridCLR supports custom dll file structures starting from v8.4.0. To enable polymorphic dll support, HybridCLR version must be at least `v8.4.0`.

:::

### codeGenerationSecretKey

codeGenerationSecretKey is the randomization key used when generating polymorphic dll code. **Please do not use the default value**, use a length of 10 or more with complex character combinations.

Modifying codeGenerationSecretKey will generate completely different dll file structures. This file structure is solidified in binary code and completely fixed after releasing the App.
**Do not** modify this value when releasing hot update dlls, as it will cause loading failures!

It is recommended to change this value when releasing new App packages. If multiple versions of App packages exist simultaneously and you want to use the same polymorphic dll, please keep codeGenerationSecretKey consistent.

### disableLoadStandardDll

Whether to prohibit loading standard structure dlls. After enabling this option, Assembly.Load or RuntimeApi.LoadMetadataForAOTAssembly must pass in polymorphic dlls. If standard dlls are passed in, an error will be returned.

Enabling this option can effectively counter malicious crackers injecting third-party dlls at runtime, because it's very difficult for them to construct dlls that conform to polymorphic dll structures, dramatically increasing injection costs.

## Making HybridCLR Support Polymorphic DLLs

The call to generate polymorphic dll code has been inserted into the `HybridCLR/ObfuzExtension/GenerateAll` command. As long as `PolymorphicDllSettings.enable` is true, related code will be automatically generated during `GenerateAll`.

If you want to actively call generation, you can call the `ObfuscateUtil::GeneratePolymorphicCodes(string libil2cppDir)` function.

## Generate Polymorphic DLLs

Call `ObfuscateUtil::GeneratePolymorphicDll(string originalDllPath, string outputDllPath)` to generate polymorphic dlls.

Regular hot update assemblies, DHE assemblies, and **supplemental metadata assemblies** can all use polymorphic dlls.
