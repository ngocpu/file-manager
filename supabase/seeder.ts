/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// CONFIG
const FOLDER_LV1 = 10
const SUB_FOLDER = 10
const FILE_PER_FOLDER = 50
const BATCH_SIZE = 500

// UTIL
const uuid = () => crypto.randomUUID()

async function getUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw error

  if (!data.users.length) {
    throw new Error('❌ Create users in Supabase Auth first')
  }

  return data.users.slice(0, 2)
}

async function clearData() {
  console.log('🗑️ Cleaning old data...')
  await supabase.from('file_permissions').delete().neq('id', uuid())
  await supabase.from('files').delete().neq('id', uuid())
  await supabase.from('profiles').delete().neq('id', uuid())
}

async function seedProfiles(users: any[]) {
  console.log('👤 Seeding profiles...')
  const profiles = users.map(u => ({
    id: u.id,
    email: u.email,
    display_name: u.email.split('@')[0]
  }))

  await supabase.from('profiles').insert(profiles)
}

async function seedFiles(ownerId: string) {
  console.log(`📂 Seeding files for user ${ownerId}`)

  const files: any[] = []

  // ROOT
  const rootId = uuid()
  files.push({
    id: rootId,
    name: 'Root',
    type: 'folder',
    parent_id: null,
    owner_id: ownerId,
    depth: 0
  })

  // LEVEL 1
  for (let i = 0; i < FOLDER_LV1; i++) {
    const folderLv1 = uuid()

    files.push({
      id: folderLv1,
      name: `Folder_${i}`,
      type: 'folder',
      parent_id: rootId,
      owner_id: ownerId,
      depth: 1
    })

    // SUB FOLDER
    for (let j = 0; j < SUB_FOLDER; j++) {
      const subId = uuid()

      files.push({
        id: subId,
        name: `Sub_${i}_${j}`,
        type: 'folder',
        parent_id: folderLv1,
        owner_id: ownerId,
        depth: 2
      })

      // FILES
      for (let k = 0; k < FILE_PER_FOLDER; k++) {
        files.push({
          name: `File_${i}_${j}_${k}.txt`,
          type: 'file',
          parent_id: subId,
          owner_id: ownerId,
          depth: 3,
          size: Math.floor(Math.random() * 500_000),
          mime_type: 'text/plain'
        })
      }
    }
  }

  console.log(`🚀 Inserting ${files.length} records...`)

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const chunk = files.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('files').insert(chunk)
    if (error) console.error(error)
    else console.log(`✅ ${i} → ${i + BATCH_SIZE}`)
  }
}

async function main() {
  const users = await getUsers()

  await clearData()
  await seedProfiles(users)

  for (const u of users) {
    await seedFiles(u.id)
  }

  console.log('🎉 SEED DONE')
}

main().catch(console.error)
