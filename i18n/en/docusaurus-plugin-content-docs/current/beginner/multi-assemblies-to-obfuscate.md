# Multiple Obfuscated Assemblies

This example demonstrates how to use multiple obfuscated and non-obfuscated assemblies. For the complete sample project, see [MultiObfuscatedAssemblies](https://github.com/focus-creative-games/obfuz-samples/tree/main/MultiObfuscatedAssemblies).

The sample project contains the following assemblies:

- NonObfus1: A non-obfuscated assembly that doesn't reference any obfuscated assemblies
- Obfus1: An obfuscated assembly that references NonObfus1
- Obfus2: An obfuscated assembly that references Obfus1
- NonObfus2: A non-obfuscated assembly that references Obfus2
- Assembly-CSharp: An obfuscated assembly that references all the above assemblies

## Create Unity Project and Assemblies

Please refer to the sample project.

## Configuration

:::tip
NonObfus1 doesn't need to be added to the `AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies` list because it doesn't reference any obfuscated assemblies.
:::

- Open the `ObfuzSettings` window
- Add Obfus1, Obfus2, and Assembly-CSharp to the `AssemblySettings.AssembliesToObfuscate` list
- Add NonObfus2 to the `AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies` list

## Generate Encryption Virtual Machine and Keys

- Run the menu `Obfuz/GenerateEncryptionVM` to generate encryption virtual machine code. The default generated code file is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`.
- Run the menu `Obfuz/GenerateSecretKeyFile` to generate two key files. The default output files are `Assets/Resources/Obfuz/defaultStaticSecretKey.bytes` and `Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## Build & Run

Click `Build And Run` in the `Player Settings` window.

## Obfuscated Code

Use [ILSpy](https://github.com/icsharpcode/ILSpy) to open `Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`.

```csharp

// Code of class A in NonObfus1.
// Since NonObfus1 is a non-obfuscated assembly, the code remains unchanged.

public class A
{
    public int x;

    public void Run()
    {
        x++;
    }
}


// Obfuscated code of class C in Obfus1


using $A;

public class $a
{
    public int $a;

    public void $A(A 1)
    {
        $a = 1.x + $D<global::$A.$d>.$I($C.$A, 0, 14, -2097817526);
    }
}

// Obfuscated code of class D in Obfus2

using $A;

public class $a
{
    public int $a;

    public void $A(A 1, $a 1)
    {
        $a = 1.x + $D<$d>.$I(global::$C.$A, 0, 14, -2097817526);
        $a = 1.$a + $D<$d>.$I(global::$C.$A, 4, 170, -1447182571);
    }
}


// Code of class B in NonObfus2

public class B
{
    public int x;

    public void Run(A a, $a c, $a d)
    {
        x += a.x + 1;
        x += c.$a + 2;
        x += d.$a + 3;
    }
}

// Code of class All in Assembly-CSharp.
// Since All is a subclass of MonoBehaviour, its class name and fields are not obfuscated.

using $A;
using UnityEngine;

public class All : MonoBehaviour
{
    public int x;

    public void $a(A 1, B 1, global::$a 1, global::$a 1)
    {
        x += 1.x + $D<$d>.$I(global::$C.$A, 0, 14, -2097817526);
        x += 1.x + $D<$d>.$I(global::$C.$A, 4, 170, -1447182571);
        x += 1.$a + $D<$d>.$I(global::$C.$A, 8, 226, 1350853308);
        x += 1.$a + $D<$d>.$I(global::$C.$A, 12, 127, 2018297415);
    }
}

```
