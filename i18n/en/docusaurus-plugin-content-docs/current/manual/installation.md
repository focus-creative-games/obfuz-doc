# Installation

Obfuz Unity Package Manager URL installation addresses:

- gitee `https://gitee.com/focus-creative-games/obfuz.git`
- github `https://github.com/focus-creative-games/obfuz.git`

Open the Unity Package Manager window, click `Add package from URL...`, and enter one of the above addresses to complete the installation.

If you want to install a specific version of Obfuz, you can add `#{version}` after the URL, such as `https://gitee.com/focus-creative-games/obfuz.git#v1.0.0-beta.2`.

## Supported Unity Versions and Platforms

- Supports Unity 2019+ versions
- Supports Unity Engine 1.0.0+ versions
- Supports all platforms supported by Unity and Unity Engine
- Supports Mono and IL2CPP backend. However, Mono backend has been tested less, so please report any issues you encounter.

In fact, earlier Unity versions are also supported, but compatibility issues with Unity build workflow may need to be resolved. Developers who need this can modify the code in `com.code-philosophy.obfuzEditor/Unity/ObfuscationProcess.cs` to be compatible with earlier versions.

## Resolving HybridCLR Compatibility Issues

Both Obfuz and HybridCLR plugins include the dnlib plugin. For Unity 2021 and earlier versions, errors occur when two packages contain plugins with the same name.

The solution is to download HybridCLR locally, remove the dnlib.dll it contains, and then place it in the Packages directory.
