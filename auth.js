(() => {
    const SESSION_KEY = 'snow-session';

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function friendlySupabaseError(error) {
        if (!error) return 'Error desconocido.';
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('row-level security') || msg.includes('rls'))
            return 'No tenés permiso para realizar esta acción. Si recién creaste la cuenta, probá recargar la página.';
        if (msg.includes('relation') && msg.includes('does not exist'))
            return 'La base de datos no está configurada correctamente. Contactá al admin.';
        if (msg.includes('duplicate key') || msg.includes('unique'))
            return 'Ya existe un usuario con ese nombre.';
        if (msg.includes('invalid input') || msg.includes('violates'))
            return 'Los datos ingresados no son válidos.';
        if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch'))
            return 'No se pudo conectar con el servidor. Verificá tu conexión a internet.';
        if (msg.includes('timeout'))
            return 'La conexión tardó demasiado. Intentá de nuevo.';
        return 'Error del servidor: ' + (error.message || 'desconocido');
    }

    async function register(username, password) {
        if (!supabaseClient) {
            throw new Error('No se pudo conectar con la base de datos. Recargá la página e intentá de nuevo.');
        }

        let existing;
        try {
            const result = await supabaseClient
                .from('users')
                .select('id')
                .eq('username', username)
                .maybeSingle();
            existing = result.data;
            if (result.error) {
                throw new Error(friendlySupabaseError(result.error));
            }
        } catch (e) {
            if (e.message && !e.message.includes('desconocido') && !e.message.includes('base de datos')) throw e;
            throw new Error('No se pudo verificar el usuario. Verificá tu conexión e intentá de nuevo.');
        }

        if (existing) {
            throw new Error('Ya existe un usuario con ese nombre. Elegí otro nombre.');
        }

        const passwordHash = await hashPassword(password);
        let data;
        try {
            const result = await supabaseClient
                .from('users')
                .insert({ username, password_hash: passwordHash, display_name: username })
                .select('id, username, display_name, role')
                .single();
            if (result.error) {
                throw new Error(friendlySupabaseError(result.error));
            }
            data = result.data;
        } catch (e) {
            if (e.message && !e.message.includes('desconocido') && !e.message.includes('servidor')) throw e;
            throw new Error('No se pudo crear la cuenta. Intentá de nuevo en unos segundos.');
        }

        if (!data || !data.id) {
            throw new Error('La cuenta se creó pero hubo un problema al cargar tu perfil. Recargá la página.');
        }

        try {
            const { count } = await supabaseClient
                .from('users')
                .select('id', { count: 'exact', head: true });
            if (count === 1) {
                await supabaseClient.from('users').update({ role: 'admin' }).eq('id', data.id);
                data.role = 'admin';
            }
        } catch (e) {
            // Non-critical: account was created, just admin promotion failed
            console.warn('Admin auto-promotion failed:', e);
        }

        setSession(data);
        return data;
    }

    async function login(username, password) {
        if (!supabaseClient) {
            throw new Error('No se pudo conectar con la base de datos. Recargá la página e intentá de nuevo.');
        }

        let user;
        try {
            const result = await supabaseClient
                .from('users')
                .select('id, username, display_name, role, password_hash')
                .eq('username', username)
                .maybeSingle();
            if (result.error) {
                throw new Error(friendlySupabaseError(result.error));
            }
            user = result.data;
        } catch (e) {
            if (e.message && !e.message.includes('desconocido') && !e.message.includes('servidor')) throw e;
            throw new Error('No se pudo verificar el usuario. Verificá tu conexión e intentá de nuevo.');
        }

        if (!user) {
            throw new Error('Usuario o contraseña incorrectos.');
        }

        const hash = await hashPassword(password);
        if (hash !== user.password_hash) {
            throw new Error('Usuario o contraseña incorrectos.');
        }

        const session = { id: user.id, username: user.username, display_name: user.display_name || user.username, role: user.role };
        setSession(session);
        return session;
    }

    function setSession(user) {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        } catch (e) {
            console.warn('No se pudo guardar la sesión:', e);
        }
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.id) return null;
            return parsed;
        } catch { return null; }
    }

    function logout() {
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch (e) {
            console.warn('Error al cerrar sesión:', e);
        }
    }

    function isAdmin() {
        const s = getSession();
        return s && s.role === 'admin';
    }

    window.Auth = { register, login, logout, getSession, isAdmin, hashPassword };
})();
