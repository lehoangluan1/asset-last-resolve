package asset.management.last_resolve.entity;

import asset.management.last_resolve.enums.AssetCondition;
import asset.management.last_resolve.enums.VerificationResult;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "verification_tasks")
public class VerificationTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private VerificationCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id", nullable = false)
    private AppUser assignedToUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expected_location_id", nullable = false)
    private Location expectedLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "expected_condition", nullable = false, length = 30)
    private AssetCondition expectedCondition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expected_assignee_id")
    private AppUser expectedAssignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observed_location_id")
    private Location observedLocation;

    @Enumerated(EnumType.STRING)
    @Column(name = "observed_condition", length = 30)
    private AssetCondition observedCondition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "observed_assignee_id")
    private AppUser observedAssignee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VerificationResult result;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_id")
    private AppUser verifiedBy;
}
