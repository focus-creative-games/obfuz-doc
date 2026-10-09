# Function Call Obfuscation

Function call obfuscation disguises how functions (static, member, or virtual) are called in code. After decompilation, it's impossible to directly know which function is being executed, effectively protecting code security.

## Implementation Principle

For each function call `xxx Foo(T1 p1, T2 p2, ...)`:

- Group called functions by their signatures, assigning each function a unique index within its group.
- Use `EncryptionService<Scope>::Encrypt(int value, int ops, int salt)` to calculate an encryptedIndex from the index.
- At the function call site, first call `EncryptionService<Scope>::Decrypt(int value, int ops, int salt)` to decrypt and get the original index.
- Replace the original function call with `xxx $Dispatch(T1 p1, T2 p2, ..., int index)`

The encryptedIndex is decrypted only when executing that code location. After decompilation, it's impossible to directly know which function is called, effectively increasing the difficulty of code cracking!

## Settings

`ObfuzSettings.CallEncryptSettings` contains settings related to constant encryption. See [Configuration](./configuration) for details.

## Proxy Mode

There are multiple methods to obfuscate function calls.

| Mode | Description |
|------|-------------|
| Dispatch | Converts function calls to indirect calls through another dispatch function. The index of the dispatch function determines the actual function called. The index value is encrypted and only decrypted at runtime, effectively preventing attackers from analyzing call relationships. |
| Delegate | Converts function calls to precomputed delegates. Delegate objects are bound to elements at specific indexes in a `delegate[]` array at runtime. The index value is encrypted and only decrypted at runtime, effectively preventing attackers from analyzing call relationships. |

There's no significant difference in obfuscation level or runtime performance between Delegate and Dispatch modes. The advantage of Delegate over Dispatch is that the generated obfuscated code is more stable, with smaller differences when code changes.

Dispatch mode is recommended for most projects. For HybridCLR premium users, reducing code changes can reduce the number of functions switched to interpreted execution, improving DHE performance, so Delegate mode is recommended.

## Encryption Level

The encryption level affects the `ops` parameter passed to `EncryptionService<Scope>::Encrypt`. See [Encryption](./encryption) for detailed information about the ops parameter.

The encryption level ranges from `[1-4]`. During encryption, the number of ops generated equals the encryption level value. As long as constant encryption is enabled, it effectively prevents cracking. Higher encryption levels provide minimal additional protection against cracking. The default value of 1 is recommended.

The `CallEncryptSettings.EncryptionLevel` field can set the global default encryption level.

## Rule Files

By default, Obfuz encrypts all function calls, but it also supports rule files to precisely control the scope and effect of constant encryption. The `CallEncryptSettings.RuleFiles` option can configure 0-N rule files.
Rule files are relative to the project directory. Valid rule file paths look like: `Assets/XXX/YYY.xml`.

Configuration example:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<obfuz>
  <whitelist>
    <assembly name="mscorlib" obfuscate="0"/>
    <assembly name="UnityEngine.*" obfuscate="0"/>
    
    <assembly name="Obfus2">
      <type name="Banana" obfuscate="0"/>
      <type name="*.TestTypeAllMethodNotObfus" obfuscate="0"/>
      <type name="*.TestTypeSomeMethodNotObfus">
          <method name="NotObfus*"/>
      </type>
    </assembly>
  </whitelist>
  
  <global obfuscationLevel="Basic">

  </global>
  
  <assembly name="Obfus2">
      <type name="*.TestNotObfusTypeAllMethods" obfuscationLevel="None"/>
      <type name="*.TestNotObfusTypeSomeMethods">
          <method name="NotObfus*" obfuscationLevel="None"/>
      </type>
      <type name="Aaaa.TopClass/SubClass" obfuscationLevel="Advanced">
      </type>
  </assembly>
</obfuz>
```

- The top-level tag must be `obfuz`
- Secondary tags can be `whitelist`, `global`, and `assembly`

### whitelist

The whitelist configures functions that won't be encrypted when called. This setting applies to all assemblies.

#### assembly

| Attribute | Optional | Default | Description |
|-----------|----------|---------|-------------|
| name | Yes | None | Name as a wildcard expression. If empty, matches all assemblies. |
| obfuscate | Yes | 1 | Whether to obfuscate calls to functions within this assembly. |

The only child element of `assembly` is `type`.

#### type

| Attribute | Optional | Default | Description |
|-----------|----------|---------|-------------|
| name | Yes | None | Name as a wildcard expression. If empty, matches all types. Nested types use `/` to separate the containing type and nested type, e.g., `test.ClassA/ClassB`. |
| obfuscate | Yes | Inherits from assembly's同名 field | Whether to obfuscate calls to functions within this type. |

The only child element of `type` is `method`.

#### method

| Attribute | Optional | Default | Description |
|-----------|----------|---------|-------------|
| name | Yes | None | Name as a wildcard expression. If empty, matches all methods. |
| obfuscate | Yes | Inherits from type's同名 field | Whether to obfuscate calls to this method. |

### global

The `global` tag defines global default encryption parameters.

| Attribute | Optional | Default | Description |
|-----------|----------|---------|-------------|
| obfuscationLevel | Yes | None | Obfuscation level, which can be None, Basic, Advanced, or MostAdvanced. |

### assembly

| Attribute | Optional | Default | Description |
|-----------|----------|---------|-------------|
| name | No | | Assembly name, which must be in the list of obfuscated assemblies. |
| Others | Yes | Inherits from global同名 options | All options from `global` can be used. If not defined, inherits values from `global`. |

The only child element of `assembly` is `type`.

### type

| Attribute | Optional | Default | Description |
|-----------|----------|---------|-------------|
| name | No | | Wildcard string for type names. If empty, matches all types. |
| Others | Yes | Inherits from assembly同名 options | All options from `global` can be used. If not defined, inherits values from `assembly`. |

Since function calls can only appear in function code, the only child element of `type` is `method`.

### method

| Attribute | Optional | Default | Description |
|-----------|----------|---------|-------------|
| name | No | | Wildcard string for method names. If empty, matches all methods. |
| Others | Yes | Inherits from assembly同名 options | All options from `global` can be used. If not defined, inherits values from `assembly`. |
