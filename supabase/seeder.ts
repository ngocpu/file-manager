/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ================= CONFIG =================
const FOLDER_LV1 = 10
const SUB_FOLDER = 10
const FILE_PER_FOLDER = 40
const BATCH_SIZE = 500

const uuid = () => crypto.randomUUID()

// ================= FILE TYPES =================
const FILE_TYPES = [
  { ext: 'txt', mime: 'text/plain', preview: true },
  { ext: 'pdf', mime: 'application/pdf', preview: true },
  { ext: 'png', mime: 'image/png', preview: true },
  { ext: 'jpg', mime: 'image/jpeg', preview: true },
  { ext: 'mp4', mime: 'video/mp4', preview: true },

  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', external: true },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', external: true },
  { ext: 'html', mime: 'text/html', external: true },

  { ext: 'zip', mime: 'application/zip' }
]

function randomFileType() {
  return FILE_TYPES[Math.floor(Math.random() * FILE_TYPES.length)]
}

// ================= USERS =================
async function getUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw error
  if (!data.users.length) throw new Error('❌ Create users first')
  return data.users.slice(0, 2)
}

// ================= CLEAN =================
async function clearData() {
  console.log('🗑️ Cleaning old data...')
  await supabase.from('file_permissions').delete().neq('id', uuid())
  await supabase.from('files').delete().neq('id', uuid())
  await supabase.from('profiles').delete().neq('id', uuid())
}

// ================= PROFILES =================
async function seedProfiles(users: any[]) {
  console.log('👤 Seeding profiles...')
  await supabase.from('profiles').insert(
    users.map(u => ({
      id: u.id,
      email: u.email,
      display_name: u.email.split('@')[0]
    }))
  )
}

// ================= FILES =================
async function seedFiles(ownerId: string) {
  console.log(`📂 Seeding files for ${ownerId}`)
  const rows: any[] = []

  const rootId = uuid()

  rows.push({
    id: rootId,
    name: 'Root',
    type: 'folder',
    parent_id: null,
    owner_id: ownerId,
    depth: 0
  })

  for (let i = 0; i < FOLDER_LV1; i++) {
    const lv1 = uuid()
    rows.push({
      id: lv1,
      name: `Folder_${i}`,
      type: 'folder',
      parent_id: rootId,
      owner_id: ownerId,
      depth: 1
    })

    for (let j = 0; j < SUB_FOLDER; j++) {
      const sub = uuid()
      rows.push({
        id: sub,
        name: `Sub_${i}_${j}`,
        type: 'folder',
        parent_id: lv1,
        owner_id: ownerId,
        depth: 2
      })

      for (let k = 0; k < FILE_PER_FOLDER; k++) {
        const ft = randomFileType()

        rows.push({
          name: `File_${i}_${j}_${k}.${ft.ext}`,
          type: 'file',
          parent_id: sub,
          owner_id: ownerId,
          depth: 3,
          size: Math.floor(Math.random() * 10_000_000),
          mime_type: ft.mime,
          preview_supported: !!ft.preview,
          external_url: ft.external ? `https://example.com/${uuid()}` : null
        })
      }
    }
  }

  console.log(`🚀 Insert ${rows.length} records`)

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('files').insert(chunk)
    if (error) console.error(error)
    else console.log(`✅ ${i} → ${i + BATCH_SIZE}`)
  }
}

// ================= MAIN =================
async function main() {
  const users = await getUsers()
  await clearData()
  await seedProfiles(users)

  for (const u of users) {
    await seedFiles(u.id)
  }

  console.log('🎉 SEED COMPLETED')
}

main().catch(console.error)
