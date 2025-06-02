A **CDR file** is primarily used for **data transmission** between Siminn and the Yellow Mobile BOSS system. Its purpose is also to define the **system's internal CDR transfer format**. These files contain **Call Detail Records (CDRs)** related to Yellow Mobile services, including **GPRS, voice, and SMS** [1, 1.3.1].

The **file format is UTF8**, and it contains **no head record or tail record**. The **fields** within each CDR record are **separated by "|"**. CDR files must adhere to **specific naming rules** such as S4PGWBnnnnnn or S4SVROnnnnnn and are transmitted frequently, typically **every 5 minutes** [3, 2.2]. There is a maximum size limit of **200M** per file [4, 2.4]. Both the file and the individual records are subject to various **validation rules** [1, 4, 4.1, 4.2].

An **example** of a single CDR record found within such a file is:
`GP|354385210000|||354385210000|274018050000024|20230919172444|3600|0|0|NLDPT||internet|||||||PGWM422420||||2|1438698513`

Based on the structure defined in the sources, we can describe the data from this example record:

1.  **RecordType**: `GP` - This indicates it is a **Native GPRS record (GGSN records)**.
2.  **Number A**: `354385210000` - The MSISDN number of a Roaming Subscriber, starting with country code 354. It is a numeric value.
3.  **Number B**: Empty (` `) - For GPRS records (Record Type RGP or GP), this value is empty.
4.  **Number Dialed**: Empty (` `) - For GPRS records (Record Type RGP or GP), this value is empty.
5.  **MSISDN**: `354385210000` - The Mobile Subscriber ISDN number, starting with country code 354. It is a numeric value.
6.  **IMSI**: `274018050000024` - The unique identification of the chargeable subscriber who used the network. It is a numeric value.
7.  **EventTimestamp**: `20230919172444` - The timestamp indicating the start of the call event in local time (Format: CCYYMMDDHHMMSS).
8.  **Event Duration**: `3600` - The total duration of the call event in seconds. Must be >= 0.
9.  **DownloadVol**: `0` - The number of incoming volume in Bytes. Mandatory for GPRS records. Must be >= 0.
10. **UploadVol**: `0` - The number of outgoing volume in Bytes. Mandatory for GPRS records. Must be >= 0.
11. **Operator Code**: `NLDPT` - A unique identifier for the roaming partner network. For Record Type GP, this value can be empty.
12. **PreratedAmount**: Empty (` `) - Charge for Prepaid service. Not mandatory.
13. **Apn**: `internet` - The Network Identifier part of the Access Point Name (APN). Mandatory within GPRS records.
14. **Nulli** (UTC Time Offset): Empty (` `) - For Record Type GP, this value can be empty.
15. **BroadWorks**: Empty (` `) - Reserved for Siminn. Not mandatory.
16. **TeleServiceCode**: Empty (` `) - Code defining a TeleService. Not mandatory.
17. **BearerServiceCode**: Empty (` `) - Code defining a Bearer Service. Not mandatory.
18. **OverseasCode**: Empty (` `) - Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
19. **VideoIndicator**: Empty (` `) - Identifier for whether a service is a video call. Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
20. **Source**: Empty (` `) - ID of the CDR file/roaming file the CDR originates from. Not mandatory.
21. **ServiceId**: Empty (` `) - Identifier for the service type. Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
22. **Quantity**: Empty (` `) - Identifier for the service Quantity. Not applicable for Yellow, part of a standard Siminn record. Not mandatory.
23. **CustNumber**: Empty (` `) - Not applicable for Yellow, part of a standard Siminn record.
24. **Description**: Empty (` `) - Not applicable for Yellow, part of a standard Siminn record.
25. **CallIdentification**: `1438698513` - The unique record ID from the originating system. It is a numeric value.
