package com.mangastudio.repository;

import com.mangastudio.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    // Le tri et la pagination des listes passent par Pageable (findAll(Pageable)).
}
