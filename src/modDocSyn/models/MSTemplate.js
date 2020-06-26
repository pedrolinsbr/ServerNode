    
module.exports = function (app, cb) {
    
    var api = {};

    //-----------------------------------------------------------------------\\    

    api.getMSXML = function (o) {

        var strXML = 
            `<?xml version="1.0" encoding="UTF-8"?>
                <MilestoneDataMessage>
                <TransactionInfo>
                    <MessageSender>BRAVO</MessageSender>
                    <MessageRecipient>SYNGENTA</MessageRecipient>
                    <MessageID>${o.IDMSG}</MessageID>
                    <Created>${o.DTCREATE}</Created>
                    <FileName>${o.FILENAME}</FileName>
                </TransactionInfo>
                <OneReferenceMultipleMilestones>
                    <MilestoneInfo>
                        <PurposeCode>${o.PURPOSE}</PurposeCode>
                        <MilestoneTypeCode>${o.MSTYPE}</MilestoneTypeCode>
                        `;

        if (o.REASCODE) strXML += `<MilestoneReasonCode>${o.REASCODE}</MilestoneReasonCode>`;

        strXML += `
                        <MilestoneTime dateTime="${o.MSDATE}" timeZone="${process.env.LOCAL_TIMEZONE}" whichTime="EventTime" />
                        <City>
                            <CityName>${o.CITYNAME}</CityName>
                            <CountryCode>BR</CountryCode>
                            <CountryName>BRAZIL</CountryName>
                        </City>
                        `;

        if (o.REASCODE) strXML += `<Comments>${o.REASCODE}</Comments>`;

        strXML += `
                    </MilestoneInfo>
                    <ReferenceInfo>
                        <ReferenceId reference="${o.IDSHIP}" type="ShipmentID" />
                    </ReferenceInfo>
                </OneReferenceMultipleMilestones>
                </MilestoneDataMessage>`;

        return strXML;
    }

    //-----------------------------------------------------------------------\\    

    return api;
}