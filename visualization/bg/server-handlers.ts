let handlers = {} as any


handlers['make-factorial'] = async ({ num }:any) => {

  function fact(n: any):any {
    if (n === 1) {
      return 1
    }
    return n * fact(n - 1)
  }

  console.log('making factorial')
  return fact(num)
}

handlers['ring-ring'] = async () => {
  console.log('picking up the phone')
  return 'hello!'
}

export default handlers