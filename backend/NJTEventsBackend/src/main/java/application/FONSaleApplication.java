package application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EntityScan(basePackages = "entities")
@EnableJpaRepositories(basePackages = "repository")
@ComponentScan(basePackages = {"application", "controller", "service", "config", "exceptions"})
@EnableScheduling
public class FONSaleApplication {
    public static void main(String[] args) {
        SpringApplication.run(FONSaleApplication.class, args);
    }
}