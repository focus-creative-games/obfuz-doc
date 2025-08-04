# Quick Start

:::tip
Obfuz supports Unity 2019+ and Unite Engine 1.0.0+, working correctly on all platforms supported by Unity and Unite Engine.
:::

This document will guide you through creating an Obfuz sample project from scratch. For the complete sample project, see [QuickStart](https://github.com/focus-creative-games/obfuz-samples/tree/main/QuickStart).

## Create a Project

Create an empty Unity project. Create a main scene and add it to the scene list in the `Build Settings` window.

## Installation

Obfuz's Unity Package Manager URL installation addresses:

- gitee `https://gitee.com/focus-creative-games/obfuz.git`
- github `https://github.com/focus-creative-games/obfuz.git`

Open the Unity Package Manager window, click `Add package from URL...`, and enter one of the above addresses to complete the installation.

## Configuration

For simplicity, we will configure the default assembly `Assembly-CSharp` as the assembly to be obfuscated.

Open the `Obfuz/Settings...` menu, expand the `Assembly Settings` item, and add `Assembly-CSharp` to the `Assemblies To Obfuscate` configuration.

## Generate Encryption Virtual Machine and Keys

- Run the menu `Obfuz/GenerateEncryptionVM` to generate encryption virtual machine code. The default generated code file is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`.
- Run the menu `Obfuz/GenerateSecretKeyFile` to generate two key files. The default output files are `Assets/Resources/Obfuz/defaultStaticSecretKey.bytes` and `Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`.

## Add Code

- Create a `Bootstrap.cs` code file in the `Assets` directory with the following content:

```csharp
using Obfuz;
using Obfuz.EncryptionVM;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class Bootstrap : MonoBehaviour
{
    // After initializing EncryptionService, the obfuscated code can run normally,
    // so initialize it as early as possible.
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecretKey()
    {
        Debug.Log("SetUpStaticSecret begin");
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log("SetUpStaticSecret end");
    }

    int Add(int a, int b)
    {
        return a + b + 1;
    }

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log("Hello, Obfuz");
        int a = Add(10, 20);
        Debug.Log($"a = {a}");
    }
}

```

## Attach Script

Create a GameObject in the scene, then attach the `Bootstrap` script to this GameObject.

Test run in Unity Editor to ensure there are no errors.

## Build & Run

Run `Build And Run` in `Build Settings` to build and run. Obfuz will insert obfuscation operations for Assembly-CSharp during the build process.
The original file is backed up to `Library/Obfuz/{buildTarget}/OriginalAssemblies/Assembly-CSharp.dll`.
The obfuscated file is backed up to `Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`.

Check Player.log to verify that the running log is consistent with the Editor running result.

## View Obfuscated Assembly-CSharp

Use [ILSpy](https://github.com/icsharpcode/ILSpy) to open `Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`.
You will find that the assembly has indeed been obfuscated.

The obfuscated Boostrap class code becomes:

```csharp

using $a;
using $A;
using UnityEngine;

public class Bootstrap : MonoBehaviour
{
    [RuntimeInitializeOnLoadMethod(/*Could not decode attribute arguments.*/)]
    private static void SetUpStaticSecretKey()
    {
        Debug.Log((object)"SetUpStaticSecret begin");
        $A.$C<$c>.$L = new global::$a.$A(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log((object)"SetUpStaticSecret end");
    }

    private int $a(int 1, int 1)
    {
        return 1 + 1 + $A.$C<$c>.$I($d.$A, 0, 14, -2097817526);
    }

    private void Start()
    {
        $e.$a($A.$C<$c>.$K($d.$A, 4, 12, 169, 534648667), $A.$C<$c>.$d(1718597184, 154, 2114032877));
        int num = $e.$A(this, $A.$C<$c>.$I($d.$A, 16, 27, -201418147), $A.$C<$c>.$I($d.$A, 20, 153, -875938825), $A.$C<$c>.$d(1757957431, 242, 760404455));
        $e.$a(string.Format($A.$C<$c>.$K($d.$A, 24, 7, 10, 1708888075), num), $A.$C<$c>.$d(1718597184, 154, 2114032877));
    }
}
```

You can see that even though we didn't mark Bootstrap as non-obfuscated, didn't disable obfuscation for the SetUpStaticSecretKey function with `[RuntimeInitializeOnLoadMethod]`, and didn't mark Awake and Start functions as non-obfuscated, Obfuz will automatically recognize these special Unity types and functions, not obfuscate their names, but still obfuscate their function bodies.

This is the power and convenience of Obfuz. It is deeply integrated with Unity workflows, simplifying obfuscation configuration as much as possible.
