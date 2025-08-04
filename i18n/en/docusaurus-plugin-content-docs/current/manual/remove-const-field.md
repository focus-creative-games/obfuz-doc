# Remove Const Fields

Const constant fields are meaningful mostly only in source code. When compiled to dll, access to constant fields is inlined, meaning the compiled code does not reference const fields.
Therefore, removing const fields will not cause code errors, unless reflection access to that field is needed.

Removing const fields can reduce effective information in obfuscated code, so these fields are removed by default during obfuscation.

## Settings

`ObfuzSettings.RemoveConstFieldSettings` contains related settings, detailed documentation can be found in [Configuration](./configuration).

## `[ObfuzIgnore]`

Constant fields affected by `[ObfuzIgnore(ObfuzScope.Field)]` will not be removed.

For example, in the ConstEncryptTestClass class below, removedField will be removed, while both preservedField and preservedField2 fields will be preserved.

```csharp
    class ConstEncryptTestClass
    {
        // This const field should be removed by the obfuscator.
        public const int removedField = 1;

        [ObfuzIgnore(ObfuzScope.Field)]
        public const int preservedField = 2;

        [ObfuzIgnore]
        public const int preservedField2 = 2;
    }
```

## Rule Files

Supports fine-grained control of which constant fields to preserve through rule files. The `RemoveConstFieldSettings.RuleFiles` option can configure 0-N rule files.
Rule file relative paths are from the project directory, valid rule file paths look like: `Assets/XXX/YYY.xml`.

Fields appearing in rule files **will not be removed**.

Configuration example:

```xml

<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
    <assembly name="Obfus1">
        <type name="Tests.RemoveConstField.ConstEncryptTestClass">
            <field name="preservedField2"/>
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
|name|No||Name of the constant field to preserve. Field name wildcard string, if empty means match all types.|
