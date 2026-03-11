/**
 * Calendly API integration utilities
 * Provides functions to validate Calendly access tokens and test integrations
 */

export interface ValidateCalendlyTokenResult {
  success: boolean;
  userUri?: string;
  userName?: string;
  userEmail?: string;
  schedulingUrl?: string;
  error?: string;
  details?: string;
}

export interface TestCalendlyIntegrationResult {
  success: boolean;
  error?: string;
  eventCount?: number;
}

/**
 * Validates a Calendly access token by fetching the current user's information
 * @param accessToken - The Calendly personal access token
 * @returns Validation result with user information if successful
 */
export async function validateCalendlyToken(
  accessToken: string
): Promise<ValidateCalendlyTokenResult> {
  try {
    if (!accessToken || !accessToken.trim()) {
      return {
        success: false,
        error: 'Access token is required',
      };
    }

    // Fetch user info from Calendly API
    const response = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Calendly API error:', errorData);
      
      // Handle specific error cases
      if (response.status === 401) {
        return {
          success: false,
          error: 'Invalid or expired access token',
          details: errorData.message || 'Authentication failed',
        };
      }
      
      if (response.status === 403) {
        return {
          success: false,
          error: 'Access token does not have required permissions',
          details: errorData.message || 'Forbidden',
        };
      }

      return {
        success: false,
        error: 'Failed to validate token',
        details: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const user = data.resource;

    if (!user || !user.uri) {
      return {
        success: false,
        error: 'Invalid response from Calendly API',
        details: 'User URI not found in response',
      };
    }

    return {
      success: true,
      userUri: user.uri,
      userName: user.name,
      userEmail: user.email,
      schedulingUrl: user.scheduling_url,
    };
  } catch (error) {
    console.error('Error validating Calendly token:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error',
        details: 'Failed to connect to Calendly API. Please check your internet connection.',
      };
    }

    return {
      success: false,
      error: 'Failed to validate token',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Tests Calendly integration by fetching event types for a user
 * This verifies that the token has the necessary permissions to access event data
 * @param accessToken - The Calendly personal access token
 * @param userUri - The Calendly user URI (from validateCalendlyToken)
 * @returns Test result with event count if successful
 */
export async function testCalendlyIntegration(
  accessToken: string,
  userUri: string
): Promise<TestCalendlyIntegrationResult> {
  try {
    if (!accessToken || !accessToken.trim()) {
      return {
        success: false,
        error: 'Access token is required',
      };
    }

    if (!userUri) {
      return {
        success: false,
        error: 'User URI is required',
      };
    }

    // First, verify the token by getting current user info
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      return {
        success: false,
        error: 'Token validation failed',
        eventCount: 0,
      };
    }

    const userData = await userResponse.json();
    const currentUserUri = userData.resource?.uri;

    // Use the current user's URI if it matches, otherwise use the provided URI
    const targetUserUri = currentUserUri === userUri ? currentUserUri : userUri;

    // Fetch event types from Calendly API
    const response = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(targetUserUri)}&active=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken.trim()}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Calendly event types API error:', errorData);
      
      // This is non-blocking - token can be valid even if event types can't be fetched
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        eventCount: 0,
      };
    }

    const data = await response.json();
    const eventTypes = data.collection || [];
    
    // Filter event types to only include those that belong to the current user
    const userSchedulingUrl = userData.resource?.scheduling_url;
    const filteredEventTypes = eventTypes.filter((eventType: any) => {
      if (!eventType.scheduling_url || !userSchedulingUrl) {
        return false;
      }
      return eventType.scheduling_url.includes(userSchedulingUrl);
    });

    return {
      success: true,
      eventCount: filteredEventTypes.length,
    };
  } catch (error) {
    console.error('Error testing Calendly integration:', error);
    
    // This is non-blocking - token can be valid even if event types can't be fetched
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      eventCount: 0,
    };
  }
}

