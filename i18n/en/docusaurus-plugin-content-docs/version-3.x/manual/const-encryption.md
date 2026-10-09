# Constant Encryption

Encrypting constants that appear in code can effectively protect code security.

## Supported Constant Types

Currently supports the following constant types:

- byte, sbyte
- short, ushort
- int, uint
- long, ulong
- IntPtr, UIntPtr
- float
- double
- string
- array including all simple type arrays byte[], sbyte[], short[], ushort[], int[], uint[], long[], ulong[], float[], double[] and high-dimensional simple arrays (like float[,,])

## Implementation Principle

- Use `EncryptionService<Scope>::Encrypt` to first calculate the encrypted value encryptedValue of the **constant**
- Save encryptedValue to rvaData (rva is a method in dll for storing large amounts of continuous data).
- Replace constants in code with `EncryptionService<Scope>::DecryptFromRva{Int|Long|Float|Double|String|Bytes}(byte[] rvaData, int offset, [int length, ] int ops, int salt)` expressions.

rvaData is also stored in encrypted form, meaning each constant requires two-step decryption when decrypted at runtime: first decrypt rvaData, then decrypt after reading encryptedValue from rvaData.

## Settings

`ObfuzSettings.ConstEncryptSettings` contains constant encryption related settings, detailed documentation can be found in [Configuration](./configuration).

## Encryption Level

Encryption level affects the `ops` parameter passed when calling `EncryptionService<Scope>::DecryptFromRvaXX`. Detailed introduction about the ops parameter can be found in [Encryption](./encryption) documentation.

Encryption level value range is `[1-4]`. During encryption, the same number of ops as the encryption level value will be generated. Simply enabling constant encryption can effectively prevent cracking. The encryption level size doesn't significantly improve anti-cracking difficulty, so it's recommended to default to 1.

The `ConstEncryptSettings.EncryptionLevel` field can set the global default encryption level.

## Rule Files

By default, Obfuz encrypts all constants, but also supports rule files to finely control the scope and effects of constant encryption. The `ConstEncryptSettings.RuleFiles` option can configure 0-N rule files.
Rule file relative paths are from the project directory, valid rule file paths look like: `Assets/XXX/YYY.xml`.

Configuration example:

```xml

<?xml version="1.0" encoding="UTF-8"?>

<obfuz>

    <whitelist type="int">1000,456</whitelist>
    <whitelist type="long">100000000000,45600000000</whitelist>
    <whitelist type="string">aaabbb</whitelist>
    <whitelist type="int-range">-100,200</whitelist>
    <whitelist type="long-range">-10000000000,20000000000</whitelist>
    <whitelist type="float-range">-100,200</whitelist>
    <whitelist type="double-range">-100,200</whitelist>
    <whitelist type="string-length-range">,3</whitelist>
    <whitelist type="array-length-range">1,3</whitelist>

    <global disableEncrypt="0" encryptInt="1" encryptLong="1" encryptFloat="1" encryptDouble="1" encryptArray="1" encryptString="1"
        encryptConstInLoop="1" encryptStringInLoop="1" cacheConstInLoop="1" cacheConstNotInLoop="0" cacheStringInLoop="1" cacheStringNotInLoop="1">
    </global>
    
    <assembly name="Obfus1" cacheConstInLoop="1" cacheConstNotInLoop="0">
        <type name="*">
            <method name="*" cacheConstInLoop="1"/>
        </type>
      <type name="Aaaa.TopClass/SubClass">
      </type>
    </assembly>
</obfuz>
```

- Top-level tag must be obfuz
- Second-level tags can be whitelist, global and assembly

### whitelist

Whitelist configures constant whitelists. Constants in the whitelist will not be encrypted. This setting takes effect for all assemblies.

|type|Description|
|-|-|
|int|int constant list, separated by `,`, can be 0-N items.|
|long|long constant list, separated by `,`, can be 0-N items.|
|string|String constant, can only fill one. Note that due to xml format itself, leading/trailing and middle whitespace characters will be ignored. Use escape characters `&lt;` to represent these special fields.|
|int-range|int integer range, value range is a closed interval. For example `100-100` represents `[100, 100]`, i.e., all integers greater than or equal to 100 and less than or equal to 100. Supports empty lower or upper bounds, indicating no limit. Like `,100` represents all integers less than or equal to 100; `100,` represents all integers greater than or equal to 100; `,` represents all integers.|
|long-range|long integer range, rules same as int-range.|
|float-range|float range, rules same as int-range.|
|double-range|double range, rules same as int-range.|
|string-length-range|String length range, strings meeting this length range will not be encrypted. Rules same as int-range.|
|array-length-range|Constant array length range, constant arrays meeting this length range will not be encrypted. Rules same as int-range.|

### global

Global defines global default encryption parameters.

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|disableEncrypt|Yes|0|Whether to disable encryption, it has higher priority than options like `encryptInt`|
|encryptInt|Yes|1|Whether to enable int encryption|
|encryptLong|Yes|1|Whether to enable long encryption|
|encryptFloat|Yes|1|Whether to enable float encryption|
|encryptDouble|Yes|1|Whether to enable double encryption|
|encryptString|Yes|1|Whether to enable string encryption|
|encryptArray|Yes|1|Whether to enable constant array encryption. Since constant array encryption is not currently supported, this configuration has no actual effect|
|encryptConstInLoop|Yes|1|Whether to encrypt int, long, float, double type constants in loops. Since loops execute multiple times, encrypting constants in loops may significantly impact performance. For example `for (int i = 0; i < 100; i++) { n += 100; }` will significantly reduce performance after enabling loop encryption|
|encryptStringInLoop|Yes|1|Whether to encrypt string type constants in loops.|
|cacheConstInLoop|Yes|1|Whether to cache int, long, float, double type constants in loops. If cached, decrypted constants will be saved in a lazily decrypted static variable, and the runtime reads this static variable instead of performing decryption operations.|
|cacheStringInLoop|Yes|1|Whether to cache string type constants in loops.|
|cacheConstNotInLoop|Yes|0|Whether to cache constants not in loops.|
|cacheStringNotInLoop|Yes|1|Whether to cache strings not in loops. Since decrypting strings each time produces GC, by default strings not in loops are also cached|

### assembly

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Assembly name, must be in the obfuscated assembly list|
|Others|Yes|Inherit same-named options from global|All options in global can be used, if not defined, inherit the value of same-named option in global|

Assembly's child elements can only be type.

### type

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Type name wildcard string, if empty means match all types. Nested types use `/` to separate the declaring type and enclosed subtypes, like `test.ClassA/ClassB`.|
|Others|Yes|Inherit same-named options from assembly|All options in global can be used, if not defined, inherit the value of same-named option in assembly|

Since constants can only appear in function code, type's child elements can only be method.

### method

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Type name wildcard string, if empty means match all types|
|Others|Yes|Inherit same-named options from assembly|All options in global can be used, if not defined, inherit the value of same-named option in assembly|
