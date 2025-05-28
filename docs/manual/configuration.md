# 设置

Obfuz提供了极其丰富的配置选项和灵活的混淆规则配置文件，以支持商业游戏项目的各种复杂的需求。

## ObfuzSettings窗口

点击菜单`Obfuz/Settings...`打开 ObfuzSettings窗口。

## 全局设置

|选项|描述|
|-|-|
|Enable| 是否开启Obfuz混淆功能。如果被禁用，Obfuz不会再在构建过程中混淆程序集，但不影响开发者主动调用混淆接口对某些程序集进行混淆。|
|Assembly Settings |混淆程序集相关设置|
|Obfuscation Pass Settings|**Obfuscation Pass**相关设置|
|Secret Settings|加密相关设置|
|Encryption VM Settings|加密虚拟机相关设置|

### Assembly Settings

设置混淆相关程序集。补充文档可见[程序集](./assembly)。

|选项|描述|
|-|-|
|Assembly To Obfuscate| 需要被混淆的程序集名列表。程序集名不包含`.dll`，示例：`Main`、`Assembly-CSharp`。如果想混淆`Obfuz.Runtime`，请开启下面的`Obfuscate Obfuz Runtime`选项，不要添加到此列表！|
|Non Obfuscated But Referenceing Obfuscated Assemblies|不需要被混淆，但引用了被混淆的程序集的程序集名列表|
|Additional Assembly Search Paths|以dll形式存在的程序集的相对搜索路径，目前Obfuz会自动搜索工程内的与当前buildTarget兼容的托管dll（含Assets及Packages及Libarary/PackageCache），因此一般**不需要**配置此项。除非托管dll在Unity工程外，或者说存在多个同名dll需要解决搜索优先级。|
|Obfuscate Obfuz Runtime|是否混淆Obfuz.Runtime程序集。默认为true，强烈建议开启此选项。|

### Obfuscation Pass Settings

设置开启哪些Obfuscation Pass。支持细化到函数或者字段级别。补充文档见[Obfuscation Pass](./obfuscation-pass)。

|选项|描述|
|-|-|
|Enabled Passes| 全局开启的Obfuscation Pass组合。如果Enabled Passes中没有启动某个Pass，即使在`Rule Files`文件中配置了该Pass也会被忽略|
|Rule Files|配置规则文件，详细文档见[Obfuscation Pass](./obfuscation-pass)|

### Secret Settings

加密相关全局设置。 补充文档见[加密](./encryption)。

|选项|描述|
|-|-|
|Default Static Secret Key| 默认的静态密钥。由于初始化时机的限制，AOT程序集一般只能使用静态密钥。如果有AOT程序集被混淆，发布App后请不要修改这个值。|
|Default Dynamic Secret Key| 默认的动态密钥。 允许在启动后完成一些事件（如代码热更新）后才加载的密钥。一般只能用于热更新程序集这种动态更新的程序集。 每次热更新前都可以修改这个值。|
|StaticSecretKeyOutputPath|默认静态密钥文档的默认输出目录。|
|DynamicSecretKeyOutputPath|默认动态密钥文档的默认输出目录。|
|Random Seed|随机数种子。该种子会影响所有的混淆和加密操作，建议定期更换。每次发布App或者热更新前都可以修改这个值。|

### Encryption VM Settings

加密虚拟机（Encryption Virtual Machine）相关设置。 补充文档见[加密](./encryption)。

|选项|描述|
|-|-|
|Code Generation Secret Key|生成虚拟机用到的起始随机数密钥兼种子。发布App后请不要修改此值。|
|Encryption Op Code Count|加密虚拟机的指令数。它的值必须是2的幂并且不小于64，默认值为256。建议不要超过1024。发布App后请不要修改值。|
|Code Output Path|生成的加密虚拟机代码的输出路径。默认为`Assets/Obfuz/GeneratedEncryptionVirtualMachine.cs`。加密虚拟机全局唯一。如果有AOT程序集被混淆，由于初始化时机的原因，加密虚拟机代码必须放到AOT程序集中。如果只对热更新代码混淆，EncryptionVM的代码也可以放到热更新程序集中。|

## Obfuscation Pass相关设置

目前已经支持多个加密或者混淆Pass，详细文档见[Obfuscation Pass](./obfuscation-pass)。

### Symbol Obfus Settings

符号混淆用于混淆程序集中类型、字段、函数、Property、event、函数参数的名称。支持通过规则文件非常精细地控制混淆范围和效果。详细文档见[符号混淆](./symbol-obfuscation)。

|选项|描述|
|-|-|
|Debug|是否开启Debug模式。禁用Debug模式时将`{Name}`混淆为`$a`之类的名字，开启Debug模式后`{Name}`会被固定混淆为`${Name}`（如`Apple`会被混淆为`$Apple`）以方便跟踪问题。Debug模式忽略所有混淆规则，也忽略符号映射文件`symbol-mapping.xml`。|
|Obfuscated Name Prefix|混淆名的前缀，会为所有生成的混淆符号前加上此前缀。默认为`$`。尽管配置为空也不影响生成不冲突的混淆名，但加上前缀有助于快速区分正常名与非混淆名|
|Use Consistent Namespace|是否为相同的Namespace生成同一个混淆后的Namespace。默认为true。如果为false，即使同名Namespace都会映射到不同的混淆后的命名空间。对于空Namespace，在混淆后保持为空，而不是为它生成混淆Namespace|
|Symbol Mapping File|混淆符号映射文件，记录了类型、函数、字段等符号原始名和混淆名的映射关系。关闭Debug模式时，混淆符号时会在保证命名不冲突的情况下优先使用Symbol Mapping File中记录的混淆名，保证了增量映射的稳定性。另外Symbol Mapping File还被[DeobfuscateStackTrace](./deobfuscate-stacktrace)工具用于还原混淆后的函数栈日志为原始函数栈日志。为了保证增量混淆的稳定，请将Symbol Mapping File**加到版本管理**|
|Rule Files|混淆规则配置文件。如果为空则对除了特殊符号外所有符号都进行混淆。详细配置规则见[符号混淆](./symbol-obfuscation)。|
|Custom Rename Policy Types|自定义符号混淆策略类全名列表。因为类型全名不含程序集名，因此要求类型全名在AppDomain所有程序集中唯一。详细配置规则见[符号混淆](./symbol-obfuscation)。|

### Const Encrypt Settings

常量加密相关设置。支持通过规则文件非常精细地控制范围和加密效果。补充文档见[常量混淆](./const-encryption)。

|选项|描述|
|-|-|
|Encryption level|加密级别，取值范围为`[1, 4]`,默认为1。 加密级别越高，加密越复杂，解密也会越耗时。|
|Rule Files| 加密规则文件列表。可以为0到多个。如果为空会对所有常量进行混淆。详细配置规则见[常量混淆](./const-encryption)。|

### Field Encrypt Settings

变量内存加密相关设置。支持通过规则文件非常精细地控制加密范围和效果。补充文档见[字段加密](./field-encryption)。

|选项|描述|
|-|-|
|Encryption level|加密级别，取值范围为`[1, 4]`,默认为1。 加密级别越高，加密越复杂，解密也会越耗时。|
|Rule Files| 加密规则文件列表。可以为0到多个。如果为空会对所有常量进行混淆。详细配置规则见[字段加密](./field-encryption)。|

### Call Obfus Settings

函数调用混淆相关设置。 支持通过规则文件非常精细地控制加密范围和效果。补充文档见[函数调用混淆](./call-obfuscation)。

|选项|描述|
|-|-|
|Encryption level|加密级别，取值范围为`[1, 4]`,默认为1。 加密级别越高，加密越复杂，解密也会越耗时。|
|Rule Files| 加密规则文件列表。可以为0到多个。如果为空会对所有常量进行混淆。详细配置规则见[函数调用混淆](./call-obfuscation)。|
