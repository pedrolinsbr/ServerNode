
    
module.exports = function (app, cb) {
    
    var api = {};

    //-----------------------------------------------------------------------\\    

    api.getPODXML = function (o) {

        var strXML = 
            `<DocumentFolder>
                <header>
                    <version>310</version>
                    <documentType>DocumentFolder</documentType>
                    <messageId>BRAVO</messageId>
                    <senderId>SYNGENTA</senderId>
                </header>

                <documentFolderDetail>
                    <messageFunctionCode>OriginalMerge</messageFunctionCode>
                    <deliveryNumber>${o.cdDelivery}</deliveryNumber>
                    <shipmentNumber>${o.shipmentNumber}</shipmentNumber>

                    <party>
                        <partyRoleCode>DocumentProvider</partyRoleCode>
                        <identification>
                        <type>DOC_PROVIDER_ID</type>
                        <value>BRAVO</value>
                        </identification>
                    </party>

                    <party>
                        <partyRoleCode>DocumentOwner</partyRoleCode>
                        <identification>
                        <type>DOC_OWNER_ID</type>
                        <value>SYNGENTA</value>
                        </identification>
                    </party>

                    <document>
                        <name>${o.strFileName}</name>
                        <encodingCode>Base64</encodingCode>
                        <mimeType>application/pdf</mimeType>
                        <documentTypeCode>POD</documentTypeCode>
                        <content>${o.strBase64}</content>
                    </document>
                </documentFolderDetail>
            </DocumentFolder>`;

        return strXML;

    }

    //-----------------------------------------------------------------------\\    

    return api;

}
