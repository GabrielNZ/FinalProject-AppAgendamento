package com.gabrielnz.agendamento.config.feign;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FeignAuthInterceptor implements RequestInterceptor {
    @Value("${api.security.internal-token}")
    private String internalToken;

    @Override
    public void apply(RequestTemplate requestTemplate) {
        String token = TokenContext.getToken();
        if (token != null) {
            requestTemplate.header("Authorization", token);
        }else {
            //@Scheduled - injeta o token de sistema
            requestTemplate.header("Authorization", "Bearer " + internalToken);
        }
    }
}
