package com.mangastudio.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    /**
     * Forward les routes frontend vers index.html pour le SPA routing.
     * Exclut : /api, /h2-console, /swagger, /v3, et les fichiers statiques (avec extension).
     * Le regex {path:[^.]*} garantit que seuls les chemins SANS point (donc sans extension) sont matchés.
     */
    @RequestMapping(value = {
        "/{path:^(?!api|h2-console|swagger|v3)[^.]*$}"
    })
    public String redirect() {
        return "forward:/index.html";
    }
}
