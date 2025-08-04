# Custom Obfuscation Rules

This example demonstrates how to configure obfuscation rule files. For the complete sample project, see [CustomConfigure](https://github.com/focus-creative-games/obfuz-samples/tree/main/CustomConfigure).

## Modify EncryptionVM Settings

Open the `ObfuzSettings` window and locate the `EncryptionVMSettings` section.

- Change the CodeGenerationSecretKey field to a custom value

## Modify Secret Settings

In the `ObfuzSettings` window, find the `SecretSettings` section.

- Change the DefaultStaticSecretKey field to a custom value
- Change the DefaultDynamicSecretKey field to a custom value
- Change the RandomSeed field to a custom integer value

## Modify Symbol Obfuscation Settings

Create a `symbol-obfuscation.xml` file in the `Assets/Obfuz` directory, and add `Assets/Obfuz/symbol-obfuscation.xml` to `SymbolObfusSettings.RuleFiles`.

The file content is as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Assembly-CSharp">
      <type name="SymbolObfus.Test1" obName="0" applyToMembers="*"/> <!-- Do not obfuscate Test1 class itself and all its members, including nested classes -->
    </assembly>
</obfuz>
```

## Modify Constant Encryption Settings

Create a `const-encrypt.xml` file in the `Assets/Obfuz` directory, and add `Assets/Obfuz/const-encrypt.xml` to `ConstEncryptSettings.RuleFiles`.
The content is as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>

    <whitelist type="int-range">-100,100</whitelist> <!-- Do not encrypt constants in the range [-100, 100] -->
    <whitelist type="string-length-range">,3</whitelist> <!-- Do not encrypt strings with length ≤ 3 -->
    
    <assembly name="Assembly-CSharp">
        <type name="ConstEncrypt.Test1" disableEncrypt="1"/> <!-- Disable constant encryption for all functions in Test1 class -->
        <type name="ConstEncrypt.Test2">
            <method name="Sum3" disableEncrypt="1"/> <!-- Do not encrypt constants in Sum3 function -->
        </type>
    </assembly>
</obfuz>
```

## Modify Field Encryption Settings

Create a `field-encrypt.xml` file in the `Assets/Obfuz` directory, and add `Assets/Obfuz/field-encrypt.xml` to `FieldEncryptSettings.RuleFiles`.
The content is as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Assembly-CSharp">
        <type name="FieldEncrypt.Test1">
            <field name="a" encrypt="1"/>
        </type>
    </assembly>
</obfuz>
```

## Modify Call Obfuscation Settings

Create a `call-obfuscation.xml` file in the `Assets/Obfuz` directory, and add `Assets/Obfuz/call-obfuscation.xml` to `CallObfusSettings.RuleFiles`.
The content is as follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
  <whitelist>
    <assembly name="mscorlib" obfuscate="0"/>
    <assembly name="UnityEngine.*" obfuscate="0"/>
  </whitelist>
  
  <assembly name="Assembly-CSharp">
      <type name="*CallObfus.Test1" disableObfuscation="1"/>
      <type name="*CallObfus.Test2">
          <method name="Run1" disableObfuscation="1"/>
      </type>
  </assembly>
</obfuz>
```

## Generate Encryption Virtual Machine and Keys

- Run the menu `Obfuz/GenerateEncryptionVM` to generate encryption virtual machine code. The default generated code file is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`.
- Run the menu `Obfuz/GenerateSecretKeyFile` to generate two key files. The default output files are `Assets/Resources/Obfuz/defaultStaticSecretKey.bytes` and `Assets/Resources/Obfuz/defaultDynamicSecretKey.bytes`

## Add Test Code

There are many files, please refer directly to [CustomConfigure](https://github.com/focus-creative-games/obfuz-samples/tree/main/CustomConfigure).

## Build & Run

Click `Build And Run` in the `Player Settings` window.

## View Obfuscated Assembly-CSharp Code

Use [ILSpy](https://github.com/icsharpcode/ILSpy) to open `Library/Obfuz/{buildTarget}/ObfuscatedAssemblies/Assembly-CSharp.dll`.
