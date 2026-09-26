export interface BootLine {
    text: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'user' | 'progress' | 'ascii' | 'blank';
    delay?: number;
    typeSpeed?: number;
    duration?: number;
    progress?: number;
    icon?: string;
}

export interface BootSequence {
    id: string;
    name: string;
    lines: BootLine[];
    totalDuration: number;
}

export const getWelcomeBootSequence = (username: string, role: string = 'user'): BootLine[] => {
    const displayName = username.toUpperCase();
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    return [
        {
            text: '╔══════════════════════════════════════════════════════════╗',
            type: 'ascii',
            delay: 100,
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗     ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗    ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║  ██║     ███████║██████╔╝██║   ██║██╔██╗ ██║██║   ██║    ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║    ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝    ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝     ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║              ▓▓▓ DIGITAL ECHO LOCATOR ▓▓▓                ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║                     v3.0.0-masterpiece                   ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '╚══════════════════════════════════════════════════════════╝',
            type: 'ascii',
            typeSpeed: 0
        },
        { text: '', type: 'blank' },
        { text: '', type: 'blank' },

        {
            text: `> [${timestamp}] CHRONOS BOOT SEQUENCE INITIATED`,
            type: 'info',
            delay: 200,
            typeSpeed: 20
        },
        {
            text: '> Loading kernel modules...',
            type: 'info',
            delay: 150,
            typeSpeed: 15
        },
        {
            text: '  ✓ core.kernel                        [OK]',
            type: 'success',
            delay: 100,
            typeSpeed: 5
        },
        {
            text: '  ✓ security.auth                       [OK]',
            type: 'success',
            delay: 80,
            typeSpeed: 5
        },
        {
            text: '  ✓ biometric.engine                    [OK]',
            type: 'success',
            delay: 80,
            typeSpeed: 5
        },
        {
            text: '  ✓ neural.network                      [OK]',
            type: 'success',
            delay: 80,
            typeSpeed: 5
        },
        {
            text: '  ✓ social.crawlers                     [OK]',
            type: 'success',
            delay: 80,
            typeSpeed: 5
        },
        { text: '', type: 'blank' },

        {
            text: '> Establishing secure connections...',
            type: 'info',
            delay: 200,
            typeSpeed: 15
        },
        {
            text: '  → PostgreSQL @ timescale-db........... CONNECTED',
            type: 'success',
            delay: 300,
            typeSpeed: 8
        },
        {
            text: '  → Redis @ cache-cluster............... CONNECTED',
            type: 'success',
            delay: 250,
            typeSpeed: 8
        },
        {
            text: '  → Celery @ worker-pool................ CONNECTED',
            type: 'success',
            delay: 250,
            typeSpeed: 8
        },
        { text: '', type: 'blank' },

        {
            text: '> Initializing AI models...',
            type: 'info',
            delay: 200,
            typeSpeed: 15
        },
        {
            text: '  ⚡ InsightFace (buffalo_l)............ LOADED',
            type: 'system',
            delay: 400,
            typeSpeed: 8
        },
        {
            text: '  ⚡ Whisper (base)..................... LOADED',
            type: 'system',
            delay: 350,
            typeSpeed: 8
        },
        {
            text: '  ⚡ ONNX Runtime (CUDA)................ ENABLED',
            type: 'system',
            delay: 250,
            typeSpeed: 8
        },
        { text: '', type: 'blank' },

        {
            text: '> Verifying user credentials...',
            type: 'info',
            delay: 200,
            typeSpeed: 15
        },
        {
            text: `  → User ID............................. ${displayName}`,
            type: 'user',
            delay: 250,
            typeSpeed: 8
        },
        {
            text: `  → Role................................ ${role.toUpperCase()}`,
            type: 'user',
            delay: 200,
            typeSpeed: 8
        },
        {
            text: '  → JWT token........................... VALID',
            type: 'success',
            delay: 200,
            typeSpeed: 8
        },
        {
            text: '  → Session expiry...................... 30:00',
            type: 'success',
            delay: 200,
            typeSpeed: 8
        },
        { text: '', type: 'blank' },

        {
            text: '> Loading user interface...',
            type: 'info',
            delay: 200,
            typeSpeed: 15
        },
        {
            text: '  [Loading components...]',
            type: 'progress',
            delay: 300,
            duration: 1200,
            progress: 100
        },
        { text: '', type: 'blank' },
        {
            text: '  [Loading 3D engine...]',
            type: 'progress',
            delay: 100,
            duration: 800,
            progress: 100
        },
        { text: '', type: 'blank' },
        {
            text: '  [Loading analytics...]',
            type: 'progress',
            delay: 100,
            duration: 600,
            progress: 100
        },
        { text: '', type: 'blank' },

        {
            text: '> All systems operational',
            type: 'success',
            delay: 300,
            typeSpeed: 10
        },
        { text: '', type: 'blank' },
        {
            text: '╔══════════════════════════════════════════════════════════╗',
            type: 'ascii',
            delay: 200,
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: `║           ▓▓▓ WELCOME BACK, ${displayName.padEnd(20)} ▓▓▓      ║`,
            type: 'ascii',
            delay: 100,
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║              ◈ SYSTEM READY FOR OPERATION ◈              ║',
            type: 'ascii',
            delay: 100,
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '╚══════════════════════════════════════════════════════════╝',
            type: 'ascii',
            delay: 100,
            typeSpeed: 0
        },
        { text: '', type: 'blank' },
        {
            text: '> Ready for user input...',
            type: 'success',
            delay: 400,
            typeSpeed: 20
        },
        {
            text: '█',
            type: 'system',
            delay: 300,
            typeSpeed: 0
        },
    ];
};

export const getNewUserBootSequence = (username: string): BootLine[] => {
    const displayName = username.toUpperCase();

    return [
        {
            text: '╔══════════════════════════════════════════════════════════╗',
            type: 'ascii',
            delay: 100,
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║       ▓▓▓ WELCOME TO CHRONOS SEARCH ENGINE ▓▓▓           ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║                  ▓▓▓ NEW OPERATOR ▓▓▓                    ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: `║                    HELLO, ${displayName.padEnd(28)} ║`,
            type: 'ascii',
            delay: 150,
            typeSpeed: 0
        },
        {
            text: '║                                                          ║',
            type: 'ascii',
            typeSpeed: 0
        },
        {
            text: '╚══════════════════════════════════════════════════════════╝',
            type: 'ascii',
            typeSpeed: 0
        },
        { text: '', type: 'blank' },
        { text: '', type: 'blank' },

        {
            text: '> First-time initialization detected',
            type: 'info',
            delay: 300,
            typeSpeed: 20
        },
        {
            text: '> Setting up your workspace...',
            type: 'info',
            delay: 200,
            typeSpeed: 15
        },
        {
            text: '  ✓ Profile created..................... [DONE]',
            type: 'success',
            delay: 250,
            typeSpeed: 8
        },
        {
            text: '  ✓ Preferences initialized............. [DONE]',
            type: 'success',
            delay: 200,
            typeSpeed: 8
        },
        {
            text: '  ✓ API keys generated.................. [DONE]',
            type: 'success',
            delay: 200,
            typeSpeed: 8
        },
        {
            text: '  ✓ Search quota allocated.............. 50/day',
            type: 'success',
            delay: 200,
            typeSpeed: 8
        },
        { text: '', type: 'blank' },

        {
            text: '> Here\'s what you can do:',
            type: 'info',
            delay: 300,
            typeSpeed: 15
        },
        {
            text: '  ⚡ Search across 12 social platforms',
            type: 'system',
            delay: 200,
            typeSpeed: 10
        },
        {
            text: '  🎯 Use face & voice biometrics',
            type: 'system',
            delay: 200,
            typeSpeed: 10
        },
        {
            text: '  📊 Analyze results with live charts',
            type: 'system',
            delay: 200,
            typeSpeed: 10
        },
        {
            text: '  🕰️  Go back up to 6 months in time',
            type: 'system',
            delay: 200,
            typeSpeed: 10
        },
        { text: '', type: 'blank' },

        {
            text: '> Loading dashboard...',
            type: 'info',
            delay: 300,
            typeSpeed: 15
        },
        {
            text: '  [Preparing environment...]',
            type: 'progress',
            delay: 200,
            duration: 1500,
            progress: 100
        },
        { text: '', type: 'blank' },
        {
            text: '> System ready. Let\'s begin.',
            type: 'success',
            delay: 400,
            typeSpeed: 20
        },
        {
            text: '█',
            type: 'system',
            delay: 300,
            typeSpeed: 0
        },
    ];
};

export const getShortBootSequence = (username: string): BootLine[] => {
    const displayName = username.toUpperCase();

    return [
        {
            text: '> Reconnecting to CHRONOS...',
            type: 'info',
            delay: 100,
            typeSpeed: 15
        },
        {
            text: '  ✓ Session restored',
            type: 'success',
            delay: 250,
            typeSpeed: 8
        },
        {
            text: '  ✓ Biometrics loaded',
            type: 'success',
            delay: 200,
            typeSpeed: 8
        },
        {
            text: '  ✓ Neural network online',
            type: 'success',
            delay: 200,
            typeSpeed: 8
        },
        { text: '', type: 'blank' },
        {
            text: `> Welcome back, ${displayName}`,
            type: 'success',
            delay: 300,
            typeSpeed: 20
        },
        {
            text: '> Ready for user input...',
            type: 'system',
            delay: 300,
            typeSpeed: 15
        },
        {
            text: '█',
            type: 'system',
            delay: 200,
            typeSpeed: 0
        },
    ];
};

export const LINE_COLORS: Record<BootLine['type'], string> = {
    info: '#22d3ee',
    success: '#4ade80',
    warning: '#facc15',
    error: '#f87171',
    system: '#a855f7',
    user: '#ec4899',
    progress: '#67e8f9',
    ascii: '#06b6d4',
    blank: 'transparent',
};

export const getLinePrefix = (type: BootLine['type']): string => {
    const prefixes: Record<BootLine['type'], string> = {
        info: '',
        success: '',
        warning: '⚠ ',
        error: '✗ ',
        system: '',
        user: '',
        progress: '',
        ascii: '',
        blank: '',
    };
    return prefixes[type] || '';
};