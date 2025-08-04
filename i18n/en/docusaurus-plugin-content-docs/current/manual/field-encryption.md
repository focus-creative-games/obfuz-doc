# Field Encryption

Encrypting field values can effectively prevent malicious attackers from using memory modification techniques to protect code security.

## Supported Variable Types

Currently supports encryption of class static variables and member variables, but does not support encryption of ordinary temporary variables within functions. Supported field types for encryption are:

- int, uint
- long, ulong
- IntPtr, UIntPtr
- float
- double

## Implementation Principle

- Fields are encrypted using `EncryptionService<Scope>::Encrypt` before writing
- Fields are decrypted using `EncryptionService<Scope>::Decrypt` before reading

Obfuz will modify all read and write operations for encrypted fields in all assemblies. This encryption process is completely transparent to the assemblies. Obfuz's field encryption algorithm ensures that 0 values map to 0 values.

Note that Obfuz only guarantees that encryption and decryption operations are performed when reading and writing encrypted fields in code. If accessed through reflection, the encrypted variables are directly operated on, which will cause errors.
MonoBehaviour, ScriptableObject, and serialization libraries like NewtonsoftJson rely heavily on reflection to read and assign field values, making them incompatible with field encryption.
Therefore, **do not configure these fields as encrypted**.

## Settings

`ObfuzSettings.FieldEncryptSettings` contains constant encryption related settings, detailed documentation can be found in [Configuration](./configuration).

## Encryption Level

The encryption level affects the `ops` parameter passed when calling `EncryptionService<Scope>::Encrypt`. For detailed introduction to the ops parameter, see the documentation [Encryption](./encryption).

The encryption level value range is `[1-4]`. During encryption, the number of ops generated equals the encryption level value. Simply enabling constant encryption can effectively prevent cracking. The encryption level size does not significantly improve the difficulty of anti-cracking, so it is recommended to default to 1.

The `FieldEncryptSettings.EncryptionLevel` field can set the global default encryption level.

## EncryptFieldAttribute

EncryptFieldAttribute provides a convenient way to mark fields as encrypted fields in code. For detailed documentation, see [Obfuz CustomAttributes](./customattributes).

It has higher priority than Obfuscation Pass rules and `[ObfuzIgnore]`. As long as a field has the `[EncryptField]` attribute, it will still be encrypted even if the field and its containing type have the `[ObfuzIgnore]` attribute.

Example code:

```csharp

[ObfuzIgnore]
class A
{
  [EncryptField]
  public int x1; // Variable x1 will still be encrypted, ignoring [ObfuzIgnore] on the type
  
  [ObfuzIgnore]
  [EncryptField]
  public int x2; // Variable x2 will still be encrypted, ignoring [ObfuzIgnore] on the field

  public int y; // Variable y will not be encrypted, nor will it be subject to any obfuscation or encryption passes
}

```

## Rule Files

Since field encryption affects field read/write performance, **no fields are encrypted by default**.

Since encrypted fields are generally very few, by design it has higher priority than Obfuscation Pass rules, but lower than `[ObfuzIgnore]`.

Supports fine-grained control of field encryption scope and effects through rule files. The `FieldEncryptSettings.RuleFiles` option can configure 0-N rule files.
Rule file relative paths are from the project directory, valid rule file paths look like: `Assets/XXX/YYY.xml`.

Configuration example:

```xml

<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Obfus1">
        <type name="*">
            <field name="a"/>
            <field name="b"/>
        </type>
    </assembly>
</obfuz>
```

- Top-level tag must be obfuz
- Second-level tags must be assembly

### assembly

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Assembly name, must be in the obfuscated assembly list|

Assembly's child elements can only be type.

### type

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Type name wildcard string, if empty means match all types. Nested types use `/` to separate the declaring type and enclosed subtype, like `test.ClassA/ClassB`.|

Since field encryption can only act on fields, type's child elements can only be field.

### field

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Name of the field to be encrypted. Field name wildcard string, if empty means match all types|
