# Using Dynamic Secret Key

Dynamic secrets are suitable for modules that execute their logic after running for a period of time, often used in hot update assemblies. For detailed documentation, see [Encryption](../manual/encryption.md).

This project demonstrates how to use dynamic secrets. For the complete sample project, see [DynamicSecretKey](https://github.com/focus-creative-games/obfuz-samples/tree/main/DynamicSecretKey).

## Installation

Same as [Quick Start](./quick-start.md).

## Project Setup

- Add Assembly-CSharp and HotUpdate assemblies to the `AssembliesToObfuscate` list in `ObfuzSettings.AssemblySettings`
- Set custom values for `DefaultStaticSecretKey` and `DefaultDynamicSecretKey` in `ObfuzSettings.SecretSettings`
- Add `HotUpdate` to the `AssembliesUsingDynamicSecretKey` list in `ObfuzSettings.SecretSettings`

## Generate Encryption Virtual Machine and Keys

- Run the menu `Obfuz/GenerateEncryptionVM` to generate encryption virtual machine code. The default generated code file is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`.
- Run the menu `Obfuz/GenerateSecretKeyFile` to generate two key files. The default output files are `Assets/Resources/Obfuz/defaultStaticSecretKey.bytes` and `Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## Create Related Assemblies and Code

- Create a `HotUpdate` assembly with only one Entry class
- Create a Bootstrap class in the Assets directory

The Entry class code is as follows:

```csharp

using UnityEngine;

public class Entry : MonoBehaviour
{
    void Start()
    {
        Debug.Log("Entry Start");
    }
}

```

The Bootstrap class code is as follows:

```csharp
using Obfuz;
using Obfuz.EncryptionVM;
using UnityEngine;


public class Bootstrap : MonoBehaviour
{
    [ObfuzIgnore]
    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterAssembliesLoaded)]
    private static void SetUpStaticSecretKey()
    {
        Debug.Log("SetUpStaticSecret begin");
        EncryptionService<DefaultStaticEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log("SetUpStaticSecret end");
    }

    private static void SetUpDynamicSecret()
    {
        Debug.Log("SetUpDynamicSecret begin");
        EncryptionService<DefaultDynamicEncryptionScope>.Encryptor = new GeneratedEncryptionVirtualMachine(Resources.Load<TextAsset>("Obfuz/defaultDynamicSecretKey").bytes);
        Debug.Log("SetUpDynamicSecret end");
    }


    void Start()
    {
        // Delayed loading, load the dynamic key only before using the HotUpdate assembly code.
        // If the project uses hot update, generally after the hot update is completed,
        // load the dynamic key before loading the hot update code.
        SetUpDynamicSecret();
        this.gameObject.AddComponent<Entry>();
    }
}
```

## Mount Script

Create a GameObject in the scene, then add the `Bootstrap` script to this GameObject.

Run in Unity Editor to ensure there are no errors.

## Build & Run

Run `Build And Run` in `Build Settings` to build and run. Check the Player.log to verify that the running log is consistent with the running result in the Editor.

## View Obfuscated Assembly-CSharp Assembly

Use [ILSpy](https://github.com/icsharpcode/ILSpy) to open `Assembly-CSharp.dll` and `HotUpdate.dll` under `Library/Obfuz/{buildTarget}/ObfuscatedAssemblies`.
You will find that the assemblies are indeed obfuscated. And `Assembly-CSharp` uses the static key, while `HotUpdate` uses the dynamic key.

The decompiled code of the obfuscated `Bootstrap` class is as follows:

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
        $A.$C<$A.$c>.$L = new global::$a.$A(Resources.Load<TextAsset>("Obfuz/defaultStaticSecretKey").bytes);
        Debug.Log((object)"SetUpStaticSecret end");
    }

    private static void $a()
    {
        $d.$a($A.$C<$A.$c>.$K(global::$C.$A, 0, 24, 137, 1750859568), $A.$C<$A.$c>.$d(1718597184, 154, 2114032877));
        $A.$C<$A.$B>.$L = new global::$a.$A($d.$b($d.$A($A.$C<$A.$c>.$K(global::$C.$A, 24, 29, 98, -1513390007), $A.$C<$A.$c>.$d(-394605899, 193, -1119998407)), $A.$C<$A.$c>.$d(1579960075, 194, -1028386777)));
        $d.$a($A.$C<$A.$c>.$K(global::$C.$A, 53, 22, 61, -331274448), $A.$C<$A.$c>.$d(1718597184, 154, 2114032877));
    }

    private void Start()
    {
        $d.$B($A.$C<$A.$c>.$d(-1185287704, 255, -1146758192));
        $d.$C($d.$c(this, $A.$C<$A.$c>.$d(694999971, 214, -840892815)), $A.$C<$A.$c>.$d(1262757717, 165, 2108602561));
    }
}
```

The obfuscated `Entry` class code is as follows:

```csharp
using $A;
using UnityEngine;

public class Entry : MonoBehaviour
{
    private void Start()
    {
        $C.$a($A.$C<$A.$B>.$K($c.$A, 0, 11, 128, -835666756), $A.$C<$A.$B>.$d(1717964360, 44, -2091590008));
    }
}

```
