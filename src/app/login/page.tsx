import React from 'react'
import AuthForm from '@/widgets/login/AuthForm'
import Logo from '@/components/misc/Logo'

const Page = () => {
  return (
    <div className="items-left mx-auto flex h-screen max-w-96 flex-col justify-center p-4 text-left">
      <Logo width={44} height={44} />
      <h2 className="w-full scroll-m-20 text-left text-3xl font-bold leading-none tracking-tight first:mt-3">
        Вход в <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">crashcop</span>
      </h2>

      <p className="w-full text-left leading-6 text-muted-foreground text-sm mt-1 mb-2">
        Авторизуйтесь с помощью данных СУШ
      </p>

      <AuthForm />
    </div>
  )
}

export default Page
