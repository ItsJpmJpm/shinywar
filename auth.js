(() => {
    const SESSION_KEY = 'snow-session';

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function register(username, password) {
        const { data: existing } = await supabaseClient
            .from('users')
            .select('id')
            .eq('username', username)
            .maybeSingle();
        if (existing) throw new Error('Ya existe un usuario con ese nombre.');

        const passwordHash = await hashPassword(password);
        const { data, error } = await supabaseClient
            .from('users')
            .insert({ username, password_hash: passwordHash, display_name: username })
            .select('id, username, display_name, role')
            .single();
        if (error) throw new Error('Error al registrar: ' + error.message);

        const { count } = await supabaseClient
            .from('users')
            .select('id', { count: 'exact', head: true });
        if (count === 1) {
            await supabaseClient.from('users').update({ role: 'admin' }).eq('id', data.id);
            data.role = 'admin';
        }

        setSession(data);
        return data;
    }

    async function login(username, password) {
        const { data: user, error } = await supabaseClient
            .from('users')
            .select('id, username, display_name, role, password_hash')
            .eq('username', username)
            .maybeSingle();
        if (error || !user) throw new Error('Usuario o contraseña incorrectos.');

        const hash = await hashPassword(password);
        if (hash !== user.password_hash) throw new Error('Usuario o contraseña incorrectos.');

        const session = { id: user.id, username: user.username, display_name: user.display_name, role: user.role };
        setSession(session);
        return session;
    }

    function setSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    function getSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    function isAdmin() {
        const s = getSession();
        return s && s.role === 'admin';
    }

    window.Auth = { register, login, logout, getSession, isAdmin, hashPassword };
})();
