import type { Metadata } from "next";
import ActionForm from "@/components/ActionForm";
import { Card, Field, PageTitle, btnCls, inputCls } from "@/components/ui";
import { getProfile } from "@/lib/supabase/server";
import { saveProfile } from "../actions";

export const metadata: Metadata = { title: "Mi perfil · Holo Club" };

const STATES = ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de México","Coahuila","Colima","Durango","Estado de México","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"];

export default async function Perfil() {
  const { profile } = await getProfile();
  if (!profile) return null;
  const v = (k: keyof typeof profile) => (profile[k] as string | null) ?? "";

  return (
    <>
      <PageTitle eyebrow="Mi cuenta" title="Perfil y envío" />
      <Card>
        <ActionForm action={saveProfile} className="flex flex-col gap-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Alias público" hint="Así apareces en el muro. 3 a 20 letras, números o _">
              <input name="alias" defaultValue={v("alias")} maxLength={20} className={inputCls} />
            </Field>
            <label className="flex items-center gap-3 self-center text-sm text-mist">
              <input type="checkbox" name="show_on_wall" defaultChecked={profile.show_on_wall} className="h-5 w-5 accent-[#3de8ff]" />
              Mostrar mis aperturas en el muro público
            </label>
          </section>
          <h2 className="m-0 font-display text-xl">Dirección de envío</h2>
          <section className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre de quien recibe"><input name="full_name" defaultValue={v("full_name")} maxLength={120} autoComplete="name" className={inputCls} /></Field>
            <Field label="Teléfono"><input name="phone" defaultValue={v("phone")} maxLength={20} autoComplete="tel" className={inputCls} /></Field>
            <Field label="Calle"><input name="street" defaultValue={v("street")} maxLength={120} autoComplete="address-line1" className={inputCls} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Núm. exterior"><input name="ext_num" defaultValue={v("ext_num")} maxLength={20} className={inputCls} /></Field>
              <Field label="Núm. interior"><input name="int_num" defaultValue={v("int_num")} maxLength={20} className={inputCls} /></Field>
            </div>
            <Field label="Colonia"><input name="colonia" defaultValue={v("colonia")} maxLength={80} className={inputCls} /></Field>
            <Field label="Código postal"><input name="postal_code" defaultValue={v("postal_code")} inputMode="numeric" pattern="[0-9]{5}" maxLength={5} autoComplete="postal-code" className={inputCls} /></Field>
            <Field label="Ciudad o municipio"><input name="city" defaultValue={v("city")} maxLength={80} autoComplete="address-level2" className={inputCls} /></Field>
            <Field label="Estado">
              <select name="state" defaultValue={v("state")} className={inputCls}>
                <option value="">Elige…</option>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Referencias"><input name="address_refs" defaultValue={v("address_refs")} maxLength={200} placeholder="Entre calles, color de la casa…" className={inputCls} /></Field>
            </div>
          </section>
          <button className={`${btnCls} self-start`}>Guardar</button>
        </ActionForm>
      </Card>
    </>
  );
}
