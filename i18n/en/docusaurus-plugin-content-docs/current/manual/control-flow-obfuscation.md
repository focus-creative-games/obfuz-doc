# Control Flow Obfuscation

Control flow obfuscation can obfuscate the direction of code control flow, making it difficult to analyze the actual execution flow of code.

## Algorithm

Currently only the following control flow obfuscation algorithms are implemented:

- Control flow flattening algorithm. This converts all code basic blocks into case items of a switch state machine, controlling the next code segment to execute by specifying the next execution index.

## Settings

`ObfuzSettings.ControlFlowObfusSettings` contains constant encryption related settings, detailed documentation can be found in [Configuration](./configuration).

## Rule Files

By default, Obfuz encrypts all function calls, but also supports rule files to finely control the scope and effects of constant encryption. The `ControlFlowObfusSettings.RuleFiles` option can configure 0-N rule files.
Rule file relative paths are from the project directory, valid rule file paths look like: `Assets/XXX/YYY.xml`.

Configuration example:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>

  <global obfuscationLevel="Basic">

  </global>
  
  <assembly name="Obfus2">
      <type name="*.TestNotObfusAnyMethods" obfuscationLevel="None"/>
      <type name="*.TestObfusAll" obfuscationLevel="Advanced"/>
      <type name="*.TestObfusSomeMethods" >
          <method name="Foo" obfuscationLevel="MostAdvanced"/>
      </type>
  </assembly>
</obfuz>
```

- Top-level tag must be obfuz
- Second-level tags can be global and assembly

### global

Global defines global default encryption parameters.

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|obfuscationLevel|Yes|None|Obfuscation level, can take values None, Basic, Advanced, MostAdvanced|

### assembly

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Assembly name, must be in the obfuscated assembly list|
|Others|Yes|Inherit same-named options from global|All options in global can be used, if not defined, inherit the value of same-named option in global|

Assembly's child elements can only be type.

### type

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Type name wildcard string, if empty means match all types|
|Others|Yes|Inherit same-named options from assembly|All options in global can be used, if not defined, inherit the value of same-named option in assembly|

Since function calls can only appear in function code, type's child elements can only be method.

### method

|Attribute|Nullable|Default|Description|
|-|-|-|-|
|name|No||Type name wildcard string, if empty means match all types|
|Others|Yes|Inherit same-named options from assembly|All options in global can be used, if not defined, inherit the value of same-named option in assembly|
