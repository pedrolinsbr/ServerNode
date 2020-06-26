    
module.exports = function (app, cb) {
    
    var api = {};

    //-----------------------------------------------------------------------\\    

    api.getHeader = function (o) {

        var strXML = 
           `<?xml version='1.0' encoding='UTF-8'?>
            <ASNMessage>
                <TransactionInfo>
                    <MessageSender>BRAVO</MessageSender>
                    <MessageRecipient>SYNGENTA</MessageRecipient>
                    <MessageID>${o.IDMSG}</MessageID> 
                    <Created>${o.DTCREATE}</Created>
                    <FileName>${o.FILENAME}</FileName> 
                </TransactionInfo>
                <ASN>
                    <ASNMessageID>${o.IDMSG}</ASNMessageID>
                    <PurposeCode>${o.PURPOSE}</PurposeCode>
                    <ShipmentID>${o.IDSHIP}</ShipmentID> 
                    <ShipmentType>DOMESTIC</ShipmentType> 
                    <PartyInfo>
                        <Type>FreightForwarder</Type>
                        <Code>BRAVO</Code>
                        <Name>Bravo Logistics</Name>
                    </PartyInfo>
                    <Mode>Truck</Mode>
                    <Carrier>
                        <Code>BRAVO</Code>
                    </Carrier>
                    <Container>
                        <LoadPlanName>${o.IDSHIP}</LoadPlanName>
                        <ContainerLoad>${o.CONTLOAD}</ContainerLoad>
                        <StringReferences>
                            <Type>StringReference1</Type>
                            <Value>${o.IDVEICUL}</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference3</Type>
                            <Value>BRAVO</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference4</Type>
                            <Value>N</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference5</Type>
                            <Value>${o.DISTANCE}</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference6</Type>
                            <Value>KM</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference21</Type>
                            <Value>${o.NRPLATRK}</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference22</Type>
                            <Value>${o.NRPLAREB}</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference23</Type>
                            <Value>${o.CDFILIAL}</Value>
                        </StringReferences>
                        <StringReferences>
                            <Type>StringReference26</Type>
                            <Value>${o.IDTRANSF}</Value>
                        </StringReferences>`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        if (([1,12].includes(o.cdInt)) && (o.DTACP)) {
            strXML += `
            <DateReferences>
                <Type>DateReference1</Type>
                <Value>${o.DTACP}</Value>
            </DateReferences>`;

        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        strXML += `
            <ReferenceNumber1>${o.NMTRANSP}</ReferenceNumber1>
            <ReferenceNumber2>${o.IDVEICUL}</ReferenceNumber2>
            <ChargeableWeight Unit="KG">${o.WEIGHT}</ChargeableWeight>
            <ActualWeight Unit="KG">${o.WEIGHT}</ActualWeight>
            <Volume Unit="M3">${o.VOLUME}</Volume>`;

        return strXML;        

    }

    //-----------------------------------------------------------------------\\

    api.getLoop = function (o, i) {

        var strXML = `
            <LineItems>
                <LoadSequence>${i.LOADORD}</LoadSequence>
                <PONumber>${i.CDDELIVE}</PONumber>
                <LineItemNumber>${i.ITEMORD}</LineItemNumber>
                <Quantity Unit="${i.QTUNIT}">${i.ITEMQTD}</Quantity> 
                <DivisionIdentifier>SYNGENTADIV</DivisionIdentifier> 
                <BLNumber>${o.BLNUMBER}</BLNumber> 
                <ProNumber>${o.BLNUMBER}</ProNumber> 
                <Weight Unit="${i.WGUNIT}">${i.ITEMWGT}</Weight> 
                <StringReferences>
                    <Type>StringReference1</Type>
                    <Value>1</Value>
                </StringReferences>
                <StringReferences>
                    <Type>StringReference2</Type>
                    <Value>${o.NRETAPA}</Value>
                </StringReferences>`;

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        if (o.TPDELIVE > 2) {

            strXML += `
                <StringReferences>
                    <Type>StringReference5</Type>  
                    <Value>${o.IDDESTIN}</Value> 
                </StringReferences>`;

        } else { 

            strXML += `
                <StringReferences>
                    <Type>StringReference6</Type>  
                    <Value>${o.CDFILIAL}</Value> 
                </StringReferences>`;

        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        var strRef9 = `
                <StringReferences>
                    <Type>StringReference9</Type>  
                    <Value>${o.IDDESTIN}</Value> 
                </StringReferences>`;

        var strRef10 = `
                <StringReferences>
                    <Type>StringReference10</Type>  
                    <Value>@DESTINO@</Value> 
                </StringReferences>
                <StringReferences>
                    <Type>StringReference12</Type>  
                    <Value></Value> 
                </StringReferences>`;

        switch (o.TPDELIVE) {

            case 2:
                strXML += strRef9;
                break;

            default:
                var strDestino = (o.TPDELIVE == 1) ? o.IDDESTIN : o.CDFILIAL;
                strXML += strRef10.replace('@DESTINO@', strDestino);
                break;

        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\

        strXML += `
                <StringReferences>
                    <Type>StringReference13</Type>
                    <Value>${o.NRETAPA}</Value>
                </StringReferences> `;

        if (o.TPDELIVE < 3) {

            strXML += `
                <StringReferences>
                    <Type>StringReference14</Type>
                    <Value>${process.env.LOCAL_TIMEZONE}</Value>
                </StringReferences>
                <StringReferences>
                    <Type>StringReference15</Type>
                    <Value>${process.env.LOCAL_TIMEZONE}</Value>
                </StringReferences>`;

        }

        if (i.IDCASA) {

            strXML += `
                <StringReferences>
                    <Type>StringReference19</Type>
                    <Value>${i.IDCASA}</Value>
                </StringReferences>`;
        }

        //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\\        

        strXML += `                
                <DateReferences>
                    <Type>DateReference1</Type> 
                    <Value>${o.DTINIETA}</Value>
                </DateReferences>
                <DateReferences>
                    <Type>DateReference2</Type> 
                    <Value>${o.DTFINETA}</Value>
                </DateReferences>
                `;

        if (o.TPDELIVE < 3) {

            strXML += 
                `<DateReferences>
                    <Type>DateReference3</Type> 
                    <Value>${o.DTAGP}</Value>
                </DateReferences>
                <DateReferences>
                    <Type>DateReference4</Type> 
                    <Value>${o.DTEAD}</Value>
                </DateReferences>
                `;

        }
         
        strXML += `</LineItems>`;

        return strXML;
    }

    //-----------------------------------------------------------------------\\

    api.getFooter = function () {

        var strXML = `
                </Container>
            </ASN>
        </ASNMessage>`;

        return strXML;

    }

    //-----------------------------------------------------------------------\\    

    return api;
}
