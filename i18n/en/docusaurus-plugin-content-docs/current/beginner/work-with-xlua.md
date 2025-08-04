# Obfuz+XLua

This project demonstrates how to use Obfuz with XLua. For the complete sample project, see [WorkWithXLua](https://github.com/focus-creative-games/obfuz-samples/tree/main/WorkWithXLua).

For detailed documentation, see [Working with XLua](../manual/xlua/work-with-xlua).

## Installation

Install the following plugins:

- com.code-philosophy.obfuz `https://github.com/focus-creative-games/obfuz.git`
- xlua `https://github.com/Tencent/xLua`

Since xlua does not directly provide a separate package repository, this sample project is directly modified from the xLua repository.

## Create Code

Create a `Bootstrap.cs` class in the Assets directory with the following code:

```csharp
using Obfuz;
using Obfuz.EncryptionVM;
using System.Collections;
using System.Collections.Generic;
using Tutorial;
using UnityEngine;


public class Bootstrap : MonoBehaviour
{
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecretKey()
    {
        //Debug.Log("SetUpStaticSecret begin");
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        //Debug.Log("SetUpStaticSecret end");
    }

    private void Awake()
    {
        ObfuscationInstincts.RegisterReflectionType<BaseClass>();
        ObfuscationInstincts.RegisterReflectionType<DerivedClass>();
        ObfuscationInstincts.RegisterReflectionType<Tutorial.ICalc>();
        ObfuscationInstincts.RegisterReflectionType<DerivedClass.InnerCalc>();
        ObfuscationInstincts.RegisterReflectionType<DerivedClass.TestEnumInner>();
        ObfuscationInstincts.RegisterReflectionType<Tutorial.TestEnum>();
    }

    void Start()
    {
        Debug.Log("Hello, Obfuz");
    }
}
```

## Edit Scene

Attach the `Boostrap` and `Tutorial.LuaCallCs` scripts to the scene.

`Tutorial.LuaCallCs` is a demo script that comes with the xLua repository, located in the `Assets/XLua/Tutorial/CSharpCallLua` directory.

## Configuration

- Add Assembly-CSharp to the `ObfuzSettings.AssembliesToObfuscate` list

## Generate Encryption Virtual Machine and Keys

- Run the menu `Obfuz/GenerateEncryptionVM` to generate encryption virtual machine code. The default generated code file is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`.
- Run the menu `Obfuz/GenerateSecretKeyFile` to generate two key files. The default output files are `Assets/Resources/Obfuz/defaultStaticSecretKey.bytes` and `Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## Register Types Accessed in xLua

When xLua registers C# types, it doesn't directly use the type name, but instead calls Type.FullName. This causes a `type not found` error when accessing C# classes in lua code after obfuscation!

A more thorough solution is to adjust the xlua implementation so that type names are determined directly when generating wrapper code, but this is more complex. We have adopted a simpler solution: using `ObfuscationTypeMapper` provided by Obfuz
to get the original type name corresponding to the Type, and modify all code in xLua that calls `Type.FullName` to `ObfuscationTypeMapper.GetOriginalTypeFullNameOrCurrent`.

For ObfuscationTypeMapper to work correctly, it is required to register the mapping relationship between Type and the original type full name in advance. Writing type full names by hand is error-prone, and `ObfuscationInstincts::RegisterReflectionType` provides a very convenient registration method.

We have added registration code in the Bootstrap.Awake function.

## Build & Run

Run `Build And Run` in `Build Settings` to build and run. Check the player.log to verify that it is running correctly.
