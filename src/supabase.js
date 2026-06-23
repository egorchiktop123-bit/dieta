import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zwqodclspfknuluwgxyw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_fWILPxWwwyvHrVf_SWKlwA_3REm1ty3'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
