<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class PasswordChangeController extends Controller
{
    public function edit(Request $request): View
    {
        return view('auth.change-password', [
            'user' => $request->user(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::min(10)],
        ]);

        $user = $request->user();
        $user->password = Hash::make($validated['password']);
        $user->must_change_password = false;
        $user->password_changed_at = now();
        $user->save();

        Auth::logoutOtherDevices($validated['password']);

        return redirect()->route('dashboard');
    }
}