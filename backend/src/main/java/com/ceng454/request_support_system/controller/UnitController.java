package com.ceng454.request_support_system.controller;

import com.ceng454.request_support_system.model.Unit;
import com.ceng454.request_support_system.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/units-control")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class UnitController {

    private final UnitService unitService;

    @GetMapping
    public List<Unit> getAllUnits() {
        return unitService.getAllUnits();
    }

    @PostMapping
    public ResponseEntity<Void> addUnit(@RequestBody Unit unit) {
        unitService.addUnit(unit.getName(), unit.getDescription());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateUnit(@PathVariable Integer id, @RequestBody Unit unit) {
        unit.setId(id);
        boolean updated = unitService.updateUnit(unit);
        if (updated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable Integer id) {
        unitService.deleteUnit(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateUnit(@PathVariable Integer id) {
        unitService.activateUnit(id);
        return ResponseEntity.ok().build();
    }
}
