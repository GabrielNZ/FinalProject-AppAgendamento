package com.gabrielnz.agendamento.config.feign;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;

@Component
public class FeignAuthInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate requestTemplate) {
        String token = TokenContext.getToken();
        if (token != null) {
            requestTemplate.header("Authorization", token);
        }
    }
}
