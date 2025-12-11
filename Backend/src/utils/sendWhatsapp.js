/**
 * Send WhatsApp message using Meta Cloud API
 * @param {Object} options - WhatsApp options
 * @param {string} options.to - Recipient phone number (E.164 format without +)
 * @param {string} options.message - Message text (for text messages)
 * @param {string} options.templateName - Template name (for template messages)
 * @returns {Promise<Object>} - Result object
 */
export default async function sendWhatsapp({ to, message, templateName }) {
  console.log(`💬 [WhatsApp] Sending to ${to}`);

  try {
    // Meta Cloud API implementation
    // Uncomment and configure when you have Meta credentials

    
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v17.0';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
    
    let payload;
    
    if (templateName) {
      // Template message
      payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' }
        }
      };
    } else {
      // Text message
      payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      };
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'WhatsApp API error');
    }
    
    return { 
      success: true, 
      messageId: data.messages[0].id 
    };
    

    // For now, just log (placeholder)
    if (templateName) {
      console.log(`✅ [WhatsApp] Would send template "${templateName}" to ${to}`);
    } else {
      console.log(`✅ [WhatsApp] Would send: "${message}" to ${to}`);
    }

    return {
      success: true,
      provider: 'meta-cloud-api',
      messageId: 'wamid_mock_' + Date.now()
    };

  } catch (error) {
    console.error(`❌ [WhatsApp] Failed to send:`, error.message);
    throw error;
  }
}

