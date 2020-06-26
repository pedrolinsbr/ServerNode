module.exports = function (app, cb) {

    var api = {};

	//-----------------------------------------------------------------------\\

    api.getInvoiceXML = function (o) {

        var strXML = 
                `<?xml version="1.0" encoding="UTF-8"?>
                <GenericInvoiceMessage>
                <TransactionInfo>
                    <Sender>
                        <Code>BRAVO</Code>
                    </Sender>
                    <Receiver>
                        <Code>SYNGENTA</Code>
                    </Receiver>
                    <File>
                        <ReceivedTime>
                            <Date>${o.DTTMZ}</Date>
                        </ReceivedTime>
                        <OriginalFile>
                            <FileType>XML</FileType>
                            <FileName>${o.FILENAME}</FileName>
                            <MessageType>GENINV</MessageType>
                            <MessageId>${o.IDMSG}</MessageId>
                            <ControlNumber>${o.IDMSG}</ControlNumber>
                            <HeaderControlNumber>${o.IDMSG}</HeaderControlNumber>
                        </OriginalFile>
                        <XMLFile>
                            <FileName>${o.FILENAME}</FileName>
                            <CreateTime>
                            <Date>${o.DTTMZ}</Date>
                            <Time>${o.HRTMZ}</Time>
                            </CreateTime>
                        </XMLFile>
                    </File>
                </TransactionInfo>
                <GenericInvoices>
                    <GenericInvoice Type="Consolidator Invoice">
                        <Purpose>${o.PURPOINV}</Purpose>
                        <InvoiceHeader>
                            <InvoiceNumber>${o.IDSHIP}-${o.IDMSG}</InvoiceNumber>
                            <InvoiceDateTime>${o.DTTMZ}T${o.HRTMZ}</InvoiceDateTime>
                        </InvoiceHeader>
                        <InvoiceDetails>
                            <InvoiceLineItem Level="Manifest Line Item">
                            <ShipmentId>${o.IDSHIP}</ShipmentId>
                            <ChargeField>
                                <Level>Manifest Line Item</Level>
                                <Type>
                                    <Code>MGMT</Code>
                                </Type>
                                <ChargeDate>
                                    <Date>${o.DTUTC}</Date>
                                    <Time>${o.HRUTC}</Time>
                                    <TimeZone>UTC</TimeZone>
                                </ChargeDate>
                                <Value>${o.VRFEE}</Value>
                                <Currency>BRL</Currency>
                                <Purpose>${o.PURPFEE}</Purpose>
                            </ChargeField>
                            <ChargeField>
                                <Level>Manifest Line Item</Level>
                                <Type>
                                    <Code>FRGT</Code>
                                </Type>
                                <ChargeDate>
                                    <Date>${o.DTUTC}</Date>
                                    <Time>${o.HRUTC}</Time>
                                    <TimeZone>UTC</TimeZone>
                                </ChargeDate>
                                <Value>${o.VRFREIGH}</Value>
                                <Currency>BRL</Currency>
                                <Purpose>${o.PURPFEE}</Purpose>
                            </ChargeField>
                            </InvoiceLineItem>
                        </InvoiceDetails>
                        <InvoiceSummary>
                            <NumberOfInvoiceLineItems>1</NumberOfInvoiceLineItems>
                        </InvoiceSummary>
                    </GenericInvoice>
                </GenericInvoices>
                </GenericInvoiceMessage>`;        

        return strXML;
    }

	//-----------------------------------------------------------------------\\
    
    return api;

}