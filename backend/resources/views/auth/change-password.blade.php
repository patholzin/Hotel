<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cambiar contraseña</title>
</head>
<body>
    <h1>Cambiar contraseña</h1>

    <p>Hola, {{ $user->name }}. Debes actualizar tu contraseña antes de continuar.</p>

    @if ($errors->any())
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    @endif

    <form method="POST" action="{{ route('password.change.update') }}">
        @csrf
        @method('PUT')

        <div>
            <label for="current_password">Contraseña actual</label>
            <input id="current_password" name="current_password" type="password" required>
        </div>

        <div>
            <label for="password">Nueva contraseña</label>
            <input id="password" name="password" type="password" required>
        </div>

        <div>
            <label for="password_confirmation">Confirmar nueva contraseña</label>
            <input id="password_confirmation" name="password_confirmation" type="password" required>
        </div>

        <button type="submit">Actualizar contraseña</button>
    </form>
</body>
</html>