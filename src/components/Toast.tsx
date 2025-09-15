"use client"
import { createContext, ReactNode, useContext, useState } from "react";



type Msg = { id: number; text: string; type?: "info"|"success"|"error" };
const Ctx = createContext<{ push: (m:Omit<Msg,"id">)=>void }|null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [list, setList] = useState<Msg[]>([]);
    const push = (m: Omit<Msg,"id">) => {
        const id = Date.now();
        setList(s => [...s, { id, ...m}]);
        setTimeout(() => setList(s => s.filter(x => x.id!==id)), 3000);
    };

    return (
        <Ctx.Provider value={{push}}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {list.map(m => (
                    <div key={m.id} className={`px-4 py-2 rounded shadow text-white ${m.type==="error" ? "bg-red-600": m.type==="success"? "bg-green-600" : "bg-black/80"}`}>
                        {m.text}
                    </div>
                ))}
            </div>
        </Ctx.Provider>
    );
}

export const useToast = () => {
    const v = useContext(Ctx);
    if(!v) throw new Error("ToastProviderでラップしてください");
    return v;
}