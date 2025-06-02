# 多个混淆程序集

本示例演示如何使用多个混淆程序集与非混淆程序集。完整示例工程[MultiObfuscatedAssemblies](https://github.com/focus-creative-games/obfuz-samples/tree/main/MultiObfuscatedAssemblies)。

示例工程包含以下程序集：

- NonObfus1  不混淆的程序集，也没有引用任何混淆后的程序集
- Obfus1 混淆程序集，引用了NonObfus1
- Obfus2 混淆程序集，引用了Obfus1
- NonObfus2 不混淆的程序集，引用了Obfus2
- Assembly-CSharp 混淆的程序集，引用了以上所有程序集

## 创建Unity工程和程序集

参考示例工程即可。

## 配置

:::tip
NonObfus1不需要加入到`AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies`列表，因为它没有引用任何混淆后的程序集。
:::

- 打开`ObfuzSettings`设置窗口
- 将 Obfus1、Obfus2、Assembly-CSharp加入到 `AssemblySettings.AssembliesToObfuscate`列表
- 将 NonObfus2加入到`AssemblySettings.NonObfuscatedButReferenceingObfuscatedAssemblies`列表

## 生成加密虚拟机及密钥

- 运行菜单`Obfuz/GenerateEncryptionVM`生成加密虚拟机代码，默认生成的代码文件为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。
- 运行菜单`Obfuz/GenerateSecretKeyFile`生成两个密钥文件。默认输出文件为`Assets/Resources/Obfuz/defaultStaticSecretKey.bytes`和`Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## 构建&运行

`Player Settings`窗口点击`Build And Run`即可。

## 混淆后的代码

使用[ILSpy](https://github.com/icsharpcode/ILSpy)打开`Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`。

```csharp

// NonObfus1中类A的代码。
// 因为NonObfus1程序集是非混淆程序集，所以代码没有改变。

public class A
{
    public int x;

    public void Run()
    {
        x++;
    }
}


// Obfus1中类C混淆后代码


using $A;

public class $a
{
    public int $a;

    public void $A(A 1)
    {
        $a = 1.x + $D<global::$A.$d>.$I($C.$A, 0, 14, -2097817526);
    }
}

// Obfus2中类D混淆后代码

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


// NonObfus2中类B的代码

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

// Assembly-CSharp中类All的代码。
// 因此All是MonoBehaviour子类，它的类名和字段没有被混淆

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
