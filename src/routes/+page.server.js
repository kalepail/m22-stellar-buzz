// import { ISSUER_PK } from '$env/static/private';

export function load() {
  return {
    
  }
}

export const actions = {
  default: async ({request}) => {
    const data = await request.formData();
    
    console.log(data.get('code'));
  }
};