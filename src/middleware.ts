import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const cookie = request.cookies.get('mytoken');
    if (request.nextUrl.pathname.includes('/Cajero')) {
        if (cookie==undefined) {
            return NextResponse.redirect(new URL("/", request.url))
        }
        try {
            const { payload } = await jwtVerify(cookie.value, new TextEncoder().encode('cajero'))
            console.log(payload)
            return NextResponse.next()
        } catch (error) {
            console.log(error)
            return NextResponse.redirect(new URL("/", request.url))
        }
    }    
    if (request.nextUrl.pathname.includes('/Atencion')) {
        if (cookie==undefined) {
            return NextResponse.redirect(new URL("/", request.url))
        }
        try {
            const { payload } = await jwtVerify(cookie.value, new TextEncoder().encode('mozo'))
            console.log(payload)
            return NextResponse.next()
        } catch (error) {
            console.log(error)
            return NextResponse.redirect(new URL("/", request.url))
        }
    }
    if (request.nextUrl.pathname.includes('/Cocinero')) {
        if (cookie==undefined) {
            return NextResponse.redirect(new URL("/", request.url))
        }
        try {
            const { payload } = await jwtVerify(cookie.value, new TextEncoder().encode('cocinero'))
            console.log(payload)
            return NextResponse.next()
        } catch (error) {
            console.log(error)
            return NextResponse.redirect(new URL("/", request.url))
        }
    }
    if (request.nextUrl.pathname.includes('/Home')) {
        if (cookie==undefined) {
            return NextResponse.redirect(new URL("/", request.url))
        }
        try {
            const { payload } = await jwtVerify(cookie.value, new TextEncoder().encode('gerente'))
            console.log(payload)
            return NextResponse.next()
        } catch (error) {
            console.log(error)
            return NextResponse.redirect(new URL("/", request.url))
        }
    }
    if (request.nextUrl.pathname.includes('/Inventario')) {
        if (cookie==undefined) {
            return NextResponse.redirect(new URL("/", request.url))
        }
        try {
            const { payload } = await jwtVerify(cookie.value, new TextEncoder().encode('supervisor'))
            console.log(payload)
            return NextResponse.next()
        } catch (error) {
            console.log(error)
            return NextResponse.redirect(new URL("/", request.url))
        }
    }
}