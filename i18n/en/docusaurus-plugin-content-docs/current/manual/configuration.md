# Configuration

Obfuz provides extremely rich configuration options and flexible obfuscation rule configuration files to support various complex requirements of commercial game projects.

## ObfuzSettings Window

Click the menu `Obfuz/Settings...` to open the ObfuzSettings window.

## Global Settings

|Option|Description|
|-|-|
|Build Pipeline Settings|Build pipeline related settings|
|Assembly Settings |Obfuscation assembly related settings|
|Obfuscation Pass Settings|**Obfuscation Pass** related settings|
|Secret Settings|Encryption related settings|
|Encryption VM Settings|Encryption virtual machine related settings|
|Garbage Code Generation Settings|Garbage code generation related settings|

### Build Pipeline Settings

Set build pipeline related parameters.

|Option|Description|
|-|-|
|Enable| Whether to enable Obfuz obfuscation functionality. If disabled, Obfuz will no longer obfuscate assemblies during the build process, but it will not affect developers actively calling obfuscation interfaces to obfuscate certain assemblies.|
|Link Xml Process Callback Order|CallbackOrder of LinkXmlProcess. Default value is 10000|
|Obfuscation Process Callback Order|CallbackOrder of ObfuscationProcess. Default value is 10000|

### Assembly Settings

Set obfuscation related assemblies. Additional documentation can be found in [Assembly](./assembly).

|Option|Description|
|-|-|
|Assembly To Obfuscate| List of assembly names that need to be obfuscated. Assembly names do not include `.dll`, examples: `Main`, `Assembly-CSharp`. If you want to obfuscate `Obfuz.Runtime`, please enable the `Obfuscate Obfuz Runtime` option below, do not add it to this list!|
|Non Obfuscated But Referenceing Obfuscated Assemblies|List of assembly names that do not need to be obfuscated but reference obfuscated assemblies|
|Additional Assembly Search Paths|Relative search paths for assemblies existing in dll form. Currently Obfuz automatically searches for managed dlls within the project that are compatible with the current buildTarget (including Assets, Packages, and Library/PackageCache), so this item generally **does not need** to be configured. Unless managed dlls are outside the Unity project, or there are multiple dlls with the same name requiring search priority resolution.|
|Obfuscate Obfuz Runtime|Whether to obfuscate the Obfuz.Runtime assembly. Default is true, strongly recommend enabling this option.|

### Obfuscation Pass Settings

Set which Obfuscation Passes to enable. Supports refinement to function or field level. Additional documentation can be found in [Obfuscation Pass](./obfuscation-pass).

|Option|Description|
|-|-|
|Enabled Passes| Globally enabled Obfuscation Pass combinations. If a Pass is not enabled in Enabled Passes, it will be ignored even if configured in `Rule Files`|
|Rule Files|Configuration rule files, detailed documentation can be found in [Obfuscation Pass](./obfuscation-pass)|

### Secret Settings

Encryption related global settings. Additional documentation can be found in [Encryption](./encryption).

|Option|Description|
|-|-|
|Default Static Secret Key| Default static key. Due to initialization timing limitations, AOT assemblies generally can only use static keys. If AOT assemblies are obfuscated, please do not modify this value after publishing the App.|
|Default Dynamic Secret Key| Default dynamic key. Keys that are allowed to be loaded only after completing some events (such as code hot updates) after startup. Generally can only be used for dynamically updated assemblies like hot update assemblies. This value can be modified before each hot update.|
|StaticSecretKeyOutputPath|Default output directory for default static key documents.|
|DynamicSecretKeyOutputPath|Default output directory for default dynamic key documents.|
|Random Seed|Random number seed. This seed affects all obfuscation and encryption operations, recommended to change regularly. This value can be modified before each App release or hot update.|

### Encryption VM Settings

Encryption Virtual Machine related settings. Additional documentation can be found in [Encryption](./encryption).

|Option|Description|
|-|-|
|Code Generation Secret Key|Starting random number key and seed used to generate the virtual machine. Please do not modify this value after publishing the App.|
|Encryption Op Code Count|Number of instructions for the encryption virtual machine. Its value must be a power of 2 and not less than 64, default value is 256. Recommended not to exceed 1024. Please do not modify the value after publishing the App.|
|Code Output Path|Output path for generated encryption virtual machine code. Default is `Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`. The encryption virtual machine is globally unique. If AOT assemblies are obfuscated, due to initialization timing reasons, the encryption virtual machine code must be placed in AOT assemblies. If only hot update code is obfuscated, EncryptionVM code can also be placed in hot update assemblies.|

### Garbage Code Generator Settings

Garbage code generator related settings. Detailed documentation can be found in [Garbage Code Generation](./garbage-code-generation).

|Option|Description|
|-|-|
|Code Generation Secret Key|Independent key used for generating garbage code|
|Default Task| Default generation task|
|Additional Tasks|Additional optional generation tasks. Each task has exactly the same structure as DefaultTask|

Task field descriptions:

|Option|Description|
|-|-|
|Code Generation Random Seed|Random generator seed used for generating garbage code|
|Class Namespace| Namespace of generated garbage code classes|
|Class Name Prefix|Class name prefix of generated garbage code classes. The final generated class names are `{class name prefix}_1`, `{class name prefix}_2`, etc.|
|Class Count|Number of generated garbage classes|
|Method Count Per Class|Number of functions in garbage classes|
|Field Count Per Class|Number of fields in garbage classes|
|Garbage Code Type|Type of generated garbage class code. Different types generate significantly different code|
|Output Path|Output path for garbage code|

## Obfuscation Pass Related Settings

Currently supports multiple encryption or obfuscation passes, detailed documentation can be found in [Obfuscation Pass](./obfuscation-pass).

### Symbol Obfus Settings

Symbol obfuscation is used to obfuscate names of types, fields, functions, properties, events, and function parameters in assemblies. Supports very fine control of obfuscation scope and effects through rule files. Detailed documentation can be found in [Symbol Obfuscation](./symbol-obfuscation).

|Option|Description|
|-|-|
|Debug|Whether to enable Debug mode. When Debug mode is disabled, `{Name}` will be obfuscated to names like `$a`. When Debug mode is enabled, `{Name}` will be consistently obfuscated to `${Name}` (e.g., `Apple` will be obfuscated to `$Apple`) to facilitate issue tracking. Debug mode ignores all obfuscation rules and also ignores the symbol mapping file `symbol-mapping.xml`.|
|Obfuscated Name Prefix|Prefix for obfuscated names, will add this prefix to all generated obfuscated symbols. Default is `$`. Although configuring it as empty does not affect generating non-conflicting obfuscated names, adding a prefix helps quickly distinguish normal names from obfuscated names|
|Use Consistent Namespace|Whether to generate the same obfuscated Namespace for the same Namespace. Default is true. If false, even namespaces with the same name will be mapped to different obfuscated namespaces. For empty Namespace, it remains empty after obfuscation rather than generating an obfuscated Namespace for it|
|Keep Unknown Symbol In Symbol Mapping File|Whether to keep unknown symbol mapping records in the symbol mapping file. Default is true. The symbol mapping file output during hot update obfuscation contains complete records, but during the build process, due to Unity's trimming behavior, some metadata is trimmed and cannot be found in the symbol mapping file. If these records are removed from the symbol mapping file, it will cause the symbol mapping generated during build to be unstable.|
|Detect Reflection Compatibility|Whether to detect compatibility issues in reflection code. Default is true. If true, it will scan all reflection operations and print errors or warnings if incompatible with symbol obfuscation. Detailed documentation can be found in [Symbol Obfuscation](./symbol-obfuscation)|
|Symbol Mapping File|Obfuscated symbol mapping file that records the mapping relationship between original names and obfuscated names of symbols like types, functions, fields, etc. When Debug mode is disabled, obfuscated symbols will prioritize using obfuscated names recorded in symbolMappingFile while ensuring no naming conflicts, ensuring stability of incremental mapping. Additionally, symbolMappingFile is also used by the [DeobfuscateStackTrace](./deobfuscate-stacktrace) tool to restore obfuscated function stack logs to original function stack logs. To ensure stability of incremental obfuscation, please **add symbolMappingFile to version control**|
|Debug Symbol Mapping File|Obfuscated symbol mapping file used when Debug mode is enabled, recording the mapping relationship between original names and obfuscated names of symbols like types, functions, fields, etc. In Debug mode, mapping relationships will not be read from debugSymbolMappingFile, but mapping relationships will be saved to debugSymbolMappingFile after obfuscation is completed. debugSymbolMappingFile is also used by the [DeobfuscateStackTrace](./deobfuscate-stacktrace) tool to restore obfuscated function stack logs to original function stack logs.|
|Rule Files|Obfuscation rule configuration files. If empty, all symbols except special symbols will be obfuscated. Detailed configuration rules can be found in [Symbol Obfuscation](./symbol-obfuscation).|
|Custom Rename Policy Types|List of custom symbol obfuscation policy class full names. Since type full names do not include assembly names, type full names must be unique across all assemblies in the AppDomain. Detailed configuration rules can be found in [Symbol Obfuscation](./symbol-obfuscation).|

### Const Encrypt Settings

Constant encryption related settings. Supports very fine control of scope and encryption effects through rule files. Additional documentation can be found in [Constant Obfuscation](./const-encryption).

|Option|Description|
|-|-|
|Encryption level|Encryption level, value range is `[1, 4]`, default is 1. Higher encryption level means more complex encryption and more time-consuming decryption.|
|Rule Files| List of encryption rule files. Can be 0 to multiple. If empty, all constants will be obfuscated. Detailed configuration rules can be found in [Constant Obfuscation](./const-encryption).|

### Remove Const Field Settings

Remove const constant field related settings. Supports fine control of which const fields to keep through rule files. Additional documentation can be found in [Remove Constant Fields](./remove-const-field).

|Option|Description|
|-|-|
|Rule Files| List of encryption rule files. Can be 0 to multiple. If empty, all constants will be obfuscated. Detailed configuration rules can be found in [Remove Constant Fields](./remove-const-field).|

### Eval Stack Obfus Settings

Execution stack obfuscation settings. Supports very fine control of scope and encryption effects through rule files. Additional documentation can be found in [Eval Stack Obfuscation](./eval-stack-obfuscation).

|Option|Description|
|-|-|
|Rule Files| List of encryption rule files. Can be 0 to multiple. If empty, all constants will be obfuscated. Detailed configuration rules can be found in [Eval Stack Obfuscation](./eval-stack-obfuscation).|

### Expr Obfus Settings

Expression obfuscation related settings. Supports very fine control of scope and encryption effects through rule files. Additional documentation can be found in [Expression Obfuscation](./expr-obfuscation).

|Option|Description|
|-|-|
|Rule Files| List of encryption rule files. Can be 0 to multiple. If empty, all constants will be obfuscated. Detailed configuration rules can be found in [Expression Obfuscation](./expr-obfuscation).|

### Field Encrypt Settings

Variable memory encryption related settings. Supports very fine control of encryption scope and effects through rule files. Additional documentation can be found in [Field Encryption](./field-encryption).

|Option|Description|
|-|-|
|Encryption level|Encryption level, value range is `[1, 4]`, default is 1. Higher encryption level means more complex encryption and more time-consuming decryption.|
|Rule Files| List of encryption rule files. Can be 0 to multiple. If empty, all constants will be obfuscated. Detailed configuration rules can be found in [Field Encryption](./field-encryption).|

### Call Obfus Settings

Function call obfuscation related settings. Supports very fine control of encryption scope and effects through rule files. Additional documentation can be found in [Call Obfuscation](./call-obfuscation).

|Option|Description|
|-|-|
|Proxy Mode|Function call obfuscation method, detailed introduction can be found in [Call Obfuscation](./call-obfuscation).|
|Encryption level|Encryption level, value range is `[1, 4]`, default is 1. Higher encryption level means more complex encryption and more time-consuming decryption.|
|maxProxyMethodCountPerDispatchMethod|Maximum number of proxy functions each dispatch function can contain. Default is 100. Recommended that this value should not exceed 1000.|
|obfuscateCallToMethodInMscorlib|Whether to obfuscate calls to functions in mscorlib. Default is false. This option and whitelist configuration in obfuscation rule files will take effect simultaneously. If this option is disabled or mscorlib is included in the whitelist assemblies, calls to functions in mscorlib assembly will not be obfuscated.|
|Rule Files| List of encryption rule files. Can be 0 to multiple. If empty, all constants will be obfuscated. Detailed configuration rules can be found in [Call Obfuscation](./call-obfuscation).|

### Control Flow Obfus Settings

Control flow obfuscation related settings. Supports very fine control of encryption scope and effects through rule files. Additional documentation can be found in [Control Flow Obfuscation](./control-flow-obfuscation).

|Option|Description|
|-|-|
|Min Instruction Count Of Basic Block To Obfuscated|Minimum instruction count of [basic blocks](https://en.wikipedia.org/wiki/Basic_block) to be obfuscated|
|Rule Files| List of encryption rule files. Can be 0 to multiple. If empty, all constants will be obfuscated. Detailed configuration rules can be found in [Call Obfuscation](./call-obfuscation).|

### Watermark Settings

Code watermark related settings. Additional documentation can be found in [Code Watermark](./watermark).

|Option|Description|
|-|-|
|Text|Watermark text embedded in code|
|Signature Length|Hash signature length of embedded watermark text|

### PolyMorphic Dll Settings

Polymorphic dll related settings. Additional documentation can be found in [Polymorphic dll Files](./hybridclr/polymorphic-dll).

|Option|Description|
|-|-|
|enable|Whether to enable polymorphic dll support. When enabled, code supporting polymorphic dll will be generated in `HybridCLR/ObfuzExtentions/GenerateAll`.|
|codeGenerationSecretKey| Randomization key used when generating polymorphic dll code|
|**disableLoadStandardDll**|**Whether to disable loading standard structure dlls**. When this option is enabled, `Assembly.Load` or `RuntimeApi.LoadMetadataForAOTAssembly` must pass polymorphic dlls. If standard dlls are passed, an error will be returned.|
