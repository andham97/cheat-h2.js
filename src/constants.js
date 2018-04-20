export const FrameFlags = {
  0x0: {
    keys: {
      0x1: 'END_STREAM',
      0x8: 'PADDED'
    },
    END_STREAM: 0x1,
    PADDED: 0x8
  },
  0x1: {
    keys: {
      0x1: 'END_STREAM',
      0x4: 'END_HEADERS',
      0x8: 'PADDED',
      0x20: 'PRIORITY'
    },
    END_STREAM: 0x1,
    END_HEADERS: 0x4,
    PADDED: 0x8,
    PRIORITY: 0x20
  },
  0x4: {
    keys: {
      0x1: 'ACK'
    },
    ACK: 0x1
  },
  0x5: {
    keys: {
      0x4: 'END_HEADERS',
      0x8: 'PADDED'
    },
    END_HEADERS: 0x4,
    PADDED: 0x8
  },
  0x6: {
    keys: {
      0x1: 'ACK'
    },
    ACK: 0x1
  },
  0x9: {
    keys: {
      0x4: 'END_HEADERS'
    },
    END_HEADERS: 0x4
  }
}

export const FrameTypes = {
  keys: {
    0x0: 'DATA',
    0x1: 'HEADERS',
    0x2: 'PRIORITY',
    0x3: 'RST_STREAM',
    0x4: 'SETTINGS',
    0x5: 'PUSH_PROMISE',
    0x6: 'PING',
    0x7: 'GOAWAY',
    0x8: 'WINDOW_UPDATE',
    0x9: 'CONTINUATION'
  },
  DATA: 0x0,
  HEADERS: 0x1,
  PRIORITY: 0x2,
  RST_STREAM: 0x3,
  SETTINGS: 0x4,
  PUSH_PROMISE: 0x5,
  PING: 0x6,
  GOAWAY: 0x7,
  WINDOW_UPDATE: 0x8,
  CONTINUATION: 0x9
}

export const ErrorCodes = {
  keys: {
    0x0: 'NO_ERROR',
    0x1: 'PROTOCOL_ERROR',
    0x2: 'INTERNAL_ERROR',
    0x3: 'FLOW_CONTROL_ERROR',
    0x4: 'SETTINGS_TIMEOUT',
    0x5: 'STREAM_CLOSED',
    0x6: 'FRAME_SIZE_ERROR',
    0x7: 'REFUSED_STREAM',
    0x8: 'CANCEL',
    0x9: 'COMPRESSION_ERROR',
    0xa: 'CONNECT_ERROR',
    0xb: 'ENHANCE_YOUR_CLAIM',
    0xc: 'INADEQUATE_SECURITY',
    0xd: 'HTTP_1_1_REQUIRED'
  },
  NO_ERROR: 0x0,
  PROTOCOL_ERROR: 0x1,
  INTERNAL_ERROR: 0x2,
  FLOW_CONTROL_ERROR: 0x3,
  SETTINGS_TIMEOUT: 0x4,
  STREAM_CLOSED: 0x5,
  FRAME_SIZE_ERROR: 0x6,
  REFUSED_STREAM: 0x7,
  CANCEL: 0x8,
  COMPRESSION_ERROR: 0x9,
  CONNECT_ERROR: 0xa,
  ENHANCE_YOUR_CLAIM: 0xb,
  INADEQUATE_SECURITY: 0xc,
  HTTP_1_1_REQUIRED: 0xd
}

export const SettingsEntries = {
  keys: {
    0x1: 'SETTINGS_HEADER_TABLE_SIZE',
    0x2: 'SETTINGS_ENABLE_PUSH',
    0x3: 'SETTINGS_MAX_CONCURRENT_STREAMS',
    0x4: 'SETTINGS_INITIAL_WINDOW_SIZE',
    0x5: 'SETTINGS_MAX_FRAME_SIZE',
    0x6: 'SETTINGS_MAX_HEADER_LIST_SIZE'
  },
  SETTINGS_HEADER_TABLE_SIZE: 0x1,
  SETTINGS_ENABLE_PUSH: 0x2,
  SETTINGS_MAX_CONCURRENT_STREAMS: 0x3,
  SETTINGS_INITIAL_WINDOW_SIZE: 0x4,
  SETTINGS_MAX_FRAME_SIZE: 0x5,
  SETTINGS_MAX_HEADER_LIST_SIZE: 0x6
}
